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

  const beers = await prisma.beer.findMany({ orderBy: [{ active: 'asc' }, { name: 'asc' }] });
  return new Response(JSON.stringify(beers), { status: 200 });
}

async function PATCH(request) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const { beers } = await request.json();
  if (!Array.isArray(beers)) {
    return new Response(JSON.stringify({ error: 'Format invalide' }), { status: 400 });
  }

  for (const b of beers) {
    await prisma.beer.update({
      where: { id: b.id },
      data: {
        price33: Math.max(0, Number(b.price33) || 0),
        price75: Math.max(0, Number(b.price75) || 0),
        depositCents33: Math.max(0, Math.round(Number(b.depositCents33) || 0)),
        depositCents75: Math.max(0, Math.round(Number(b.depositCents75) || 0)),
        active: !!b.active,
      },
    });
  }

  const updated = await prisma.beer.findMany({ orderBy: [{ active: 'asc' }, { name: 'asc' }] });
  return new Response(JSON.stringify(updated), { status: 200 });
}

module.exports = { GET, PATCH };
