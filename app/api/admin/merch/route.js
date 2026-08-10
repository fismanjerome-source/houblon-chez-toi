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

  const products = await prisma.merchProduct.findMany({ orderBy: { name: 'asc' } });
  return new Response(JSON.stringify(products), { status: 200 });
}

async function PATCH(request) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const { products } = await request.json();
  if (!Array.isArray(products)) {
    return new Response(JSON.stringify({ error: 'Format invalide' }), { status: 400 });
  }

  for (const p of products) {
    await prisma.merchProduct.update({
      where: { id: p.id },
      data: {
        name: p.name,
        description: p.description ?? undefined,
        priceCents: Math.max(0, Math.round(Number(p.priceCents) || 0)),
        active: !!p.active,
      },
    });
  }

  const updated = await prisma.merchProduct.findMany({ orderBy: { name: 'asc' } });
  return new Response(JSON.stringify(updated), { status: 200 });
}

module.exports = { GET, PATCH };
