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

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  return new Response(JSON.stringify(codes), { status: 200 });
}

async function POST(request) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const { code, kind, discountType, discountValue, maxUses, expiresAt, restrictToEmail } = await request.json();
  if (!code || !discountValue) {
    return new Response(JSON.stringify({ error: 'Code et valeur de remise requis' }), { status: 400 });
  }

  const upper = code.trim().toUpperCase();
  const existingCode = await prisma.promoCode.findUnique({ where: { code: upper } });
  if (existingCode) return new Response(JSON.stringify({ error: 'Ce code existe déjà' }), { status: 409 });
  const existingReferral = await prisma.user.findUnique({ where: { referralCode: upper } });
  if (existingReferral) return new Response(JSON.stringify({ error: 'Ce code est déjà utilisé comme code de parrainage personnel' }), { status: 409 });

  const created = await prisma.promoCode.create({
    data: {
      code: upper,
      kind: kind === 'PARTNER_REFERRAL' ? 'PARTNER_REFERRAL' : 'PROMO',
      discountType: discountType === 'PERCENT' ? 'PERCENT' : 'FIXED',
      discountValue: discountType === 'PERCENT' ? Number(discountValue) : Math.round(Number(discountValue) * 100),
      maxUses: maxUses ? Math.max(1, Math.round(Number(maxUses))) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      restrictToEmail: restrictToEmail || null,
    },
  });

  return new Response(JSON.stringify(created), { status: 201 });
}

module.exports = { GET, POST };
