const { prisma } = require('../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
const { computeDeliveryFeeCents } = require('../../../lib/delivery');
const { sendEmail } = require('../../../lib/email');
const { orderConfirmationEmail, reviewRequestEmail, SITE_URL } = require('../../../lib/emailTemplates');

function getSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(match[1]);
}

async function GET(request) {
  const session = getSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: { include: { beer: true, glass: true } }, depositReturns: { include: { beer: true } }, extras: true, invoice: true },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(JSON.stringify(orders), { status: 200 });
}

async function POST(request) {
  const session = getSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const { town, slot, items, pickup, returns, extras } = await request.json();
  // items: [{ beerId, format, quantity, glassId }]
  // returns: [{ beerId, format, quantity }]
  // extras: [{ kind: 'basket' | 'merch', refId, quantity }]
  if ((!items || !items.length) && (!extras || !extras.length)) {
    return new Response(JSON.stringify({ error: 'Panier vide' }), { status: 400 });
  }

  const safeItems = items || [];
  const allBeerIds = [...new Set([...safeItems.map((i) => i.beerId), ...(returns || []).map((r) => r.beerId)])];
  const beers = await prisma.beer.findMany({ where: { id: { in: allBeerIds } } });
  const glassIds = safeItems.map((i) => i.glassId).filter(Boolean);
  const glasses = glassIds.length ? await prisma.glass.findMany({ where: { id: { in: glassIds } } }) : [];

  let itemsTotalCents = 0;
  let depositChargedCents = 0;
  const orderItemsData = safeItems.map((item) => {
    const beer = beers.find((b) => b.id === item.beerId);
    if (!beer) throw new Error('Bière introuvable');
    const glass = item.glassId ? glasses.find((g) => g.id === item.glassId && g.beerId === beer.id) : null;
    const unitPrice = item.format === 75 ? beer.price75 : item.format === 33 ? beer.price33 : 0;
    const depositUnitCents = item.format === 75 ? beer.depositCents75 : item.format === 33 ? beer.depositCents33 : 0;
    const depositLineCents = depositUnitCents * item.quantity;
    let lineCents = Math.round(unitPrice * 100) * item.quantity + depositLineCents;
    if (glass) lineCents += Math.round(glass.price * 100);
    itemsTotalCents += lineCents;
    depositChargedCents += depositLineCents;
    return {
      beerId: beer.id,
      format: item.format,
      quantity: item.quantity,
      glassId: glass ? glass.id : null,
      unitPriceCents: Math.round(unitPrice * 100),
      depositCents: depositLineCents,
    };
  });

  let depositReturnedCents = 0;
  const returnItemsData = (returns || [])
    .filter((r) => r.quantity > 0)
    .map((r) => {
      const beer = beers.find((b) => b.id === r.beerId);
      if (!beer) throw new Error('Bière introuvable (reprise)');
      const depositUnitCents = r.format === 75 ? beer.depositCents75 : r.format === 33 ? beer.depositCents33 : 0;
      const creditedCents = depositUnitCents * r.quantity;
      depositReturnedCents += creditedCents;
      return { beerId: beer.id, format: r.format, quantity: r.quantity, creditedCents };
    });

  const basketIds = (extras || []).filter((x) => x.kind === 'basket' && x.quantity > 0).map((x) => x.refId);
  const merchIds = (extras || []).filter((x) => x.kind === 'merch' && x.quantity > 0).map((x) => x.refId);
  const [baskets, merchProducts] = await Promise.all([
    basketIds.length ? prisma.basket.findMany({ where: { id: { in: basketIds }, active: true } }) : [],
    merchIds.length ? prisma.merchProduct.findMany({ where: { id: { in: merchIds }, active: true } }) : [],
  ]);

  let extrasTotalCents = 0;
  const extrasData = (extras || [])
    .filter((x) => x.quantity > 0)
    .map((x) => {
      const source = x.kind === 'basket' ? baskets.find((b) => b.id === x.refId) : merchProducts.find((m) => m.id === x.refId);
      if (!source || source.priceCents <= 0) return null;
      const lineTotalCents = source.priceCents * x.quantity;
      extrasTotalCents += lineTotalCents;
      return { kind: x.kind, refId: source.id, name: source.name, quantity: x.quantity, unitPriceCents: source.priceCents, lineTotalCents };
    })
    .filter(Boolean);

  itemsTotalCents += extrasTotalCents;

  const deliveryFeeCents = computeDeliveryFeeCents({ pickup: !!pickup, town, itemsTotalCents: itemsTotalCents - depositChargedCents });
  const totalCents = Math.max(0, itemsTotalCents + deliveryFeeCents - depositReturnedCents);

  const order = await prisma.order.create({
    data: {
      userId: session.userId,
      town: pickup ? 'Bondues (retrait)' : town,
      pickup: !!pickup,
      slot,
      itemsTotalCents,
      deliveryFeeCents,
      depositChargedCents,
      depositReturnedCents,
      totalCents,
      items: { create: orderItemsData },
      depositReturns: returnItemsData.length ? { create: returnItemsData } : undefined,
      extras: extrasData.length ? { create: extrasData } : undefined,
    },
    include: { items: { include: { beer: true, glass: true } }, extras: true, user: true },
  });

  const confirmation = orderConfirmationEmail({ order, user: order.user });
  const reviewEmail = reviewRequestEmail({ order, user: order.user, reviewUrl: `${SITE_URL}/avis/${order.reviewToken}` });
  const reviewSendAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await Promise.all([
    sendEmail({ to: order.user.email, subject: confirmation.subject, html: confirmation.html }),
    sendEmail({ to: order.user.email, subject: reviewEmail.subject, html: reviewEmail.html, scheduledAt: reviewSendAt }),
  ]);

  return new Response(JSON.stringify(order), { status: 201 });
}

module.exports = { GET, POST };
