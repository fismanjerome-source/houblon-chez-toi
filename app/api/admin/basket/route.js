const { prisma } = require('../../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../../lib/auth');

function getAdminSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  const session = verifySessionToken(match[1]);
  return session && session.isAdmin ? session : null;
}

async function GET(request) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const basket = await prisma.basket.findFirst({ include: { beers: true } });
  return new Response(JSON.stringify(basket), { status: 200 });
}

async function PATCH(request) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const { beerIds, priceCents, active, name, description } = await request.json();

  let basket = await prisma.basket.findFirst();
  if (!basket) basket = await prisma.basket.create({ data: {} });

  const updated = await prisma.basket.update({
    where: { id: basket.id },
    data: {
      name: name || undefined,
      description: description ?? undefined,
      priceCents: Math.max(0, Math.round(Number(priceCents) || 0)),
      active: !!active,
      beers: { set: (beerIds || []).map((id) => ({ id })) },
    },
    include: { beers: true },
  });

  return new Response(JSON.stringify(updated), { status: 200 });
}

module.exports = { GET, PATCH };
