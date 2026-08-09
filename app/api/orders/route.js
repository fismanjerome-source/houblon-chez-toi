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
    include: { items: { include: { beer: true, glass: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return new Response(JSON.stringify(orders), { status: 200 });
}

async function POST(request) {
  const session = getSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const { town, slot, items, pickup } = await request.json();
  // items: [{ beerId, format, quantity, glassId }]
  if (!items || !items.length) {
    return new Response(JSON.stringify({ error: 'Panier vide' }), { status: 400 });
  }

  const beers = await prisma.beer.findMany({ where: { id: { in: items.map((i) => i.beerId) } } });
  const glassIds = items.map((i) => i.glassId).filter(Boolean);
  const glasses = glassIds.length ? await prisma.glass.findMany({ where: { id: { in: glassIds } } }) : [];

  let itemsTotalCents = 0;
  const orderItemsData = items.map((item) => {
    const beer = beers.find((b) => b.id === item.beerId);
    if (!beer) throw new Error('Bière introuvable');
    const glass = item.glassId ? glasses.find((g) => g.id === item.glassId && g.beerId === beer.id) : null;
    const unitPrice = item.format === 75 ? beer.price75 : item.format === 33 ? beer.price33 : 0;
    let lineCents = Math.round(unitPrice * 100) * item.quantity;
    if (glass) lineCents += Math.round(glass.price * 100);
    itemsTotalCents += lineCents;
    return {
      beerId: beer.id,
      format: item.format,
      quantity: item.quantity,
      glassId: glass ? glass.id : null,
      unitPriceCents: Math.round(unitPrice * 100),
    };
  });

  const deliveryFeeCents = computeDeliveryFeeCents({ pickup: !!pickup, town, itemsTotalCents });

  const order = await prisma.order.create({
    data: {
      userId: session.userId,
      town: pickup ? 'Bondues (retrait)' : town,
      pickup: !!pickup,
      slot,
      itemsTotalCents,
      deliveryFeeCents,
      totalCents: itemsTotalCents + deliveryFeeCents,
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  return new Response(JSON.stringify(order), { status: 201 });
}

module.exports = { GET, POST };
