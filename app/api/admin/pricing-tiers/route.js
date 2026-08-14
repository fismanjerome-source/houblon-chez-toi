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

  const tiers = await prisma.pricingTier.findMany({ orderBy: { minQuantity: 'asc' } });
  return new Response(JSON.stringify(tiers), { status: 200 });
}

async function PATCH(request) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const { tiers } = await request.json();
  if (!Array.isArray(tiers)) {
    return new Response(JSON.stringify({ error: 'Format invalide' }), { status: 400 });
  }

  const clean = tiers
    .map((t) => ({ minQuantity: Math.max(1, Math.round(Number(t.minQuantity) || 0)), discountPercent: Math.max(0, Math.min(100, Number(t.discountPercent) || 0)) }))
    .filter((t) => t.minQuantity > 0);

  const seen = new Set();
  for (const t of clean) {
    if (seen.has(t.minQuantity)) {
      return new Response(JSON.stringify({ error: 'Deux paliers ne peuvent pas avoir le même seuil' }), { status: 400 });
    }
    seen.add(t.minQuantity);
  }

  await prisma.$transaction([
    prisma.pricingTier.deleteMany({}),
    ...clean.map((t) => prisma.pricingTier.create({ data: t })),
  ]);

  const updated = await prisma.pricingTier.findMany({ orderBy: { minQuantity: 'asc' } });
  return new Response(JSON.stringify(updated), { status: 200 });
}

module.exports = { GET, PATCH };
