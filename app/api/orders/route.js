const { prisma } = require('../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
const { computeDeliveryFeeCents } = require('../../../lib/delivery');

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
    include: { items: { include: { beer: true, glass: true } }, depositReturns: { include: { beer: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(JSON.stringify(orders), { status: 200 });
}

async function POST(request) {
  const session = getSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const { town, slot, items, pickup, returns } = await request.json();
  // items: [{ beerId, format, quantity, glassId }]
  // returns: [{ beerId, format, quantity }]
  if (!items || !items.length) {
    return new Response(JSON.stringify({ error: 'Panier vide' }), { status: 400 });
  }

  const allBeerIds = [...new Set([...items.map((i) => i.beerId), ...(returns || []).map((r) => r.beerId)])];
  const beers = await prisma.beer.findMany({ where: { id: { in: allBeerIds } } });
  const glassIds = items.map((i) => i.glassId).filter(Boolean);
  const glasses = glassIds.length ? await prisma.glass.findMany({ where: { id: { in: glassIds } } }) : [];

  let itemsTotalCents = 0;
  let depositChargedCents = 0;
  const orderItemsData = items.map((item) => {
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
    },
    include: { items: true },
  });

  return new Response(JSON.stringify(order), { status: 201 });
}

module.exports = { GET, POST };
