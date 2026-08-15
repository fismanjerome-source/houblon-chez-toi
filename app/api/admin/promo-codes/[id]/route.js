const { prisma } = require('../../../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../../../lib/auth');

function getAdminSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  const session = verifySessionToken(match[1]);
  return session && session.isAdmin ? session : null;
}

async function PATCH(request, { params }) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const { active } = await request.json();
  const updated = await prisma.promoCode.update({ where: { id: params.id }, data: { active: !!active } });
  return new Response(JSON.stringify(updated), { status: 200 });
}

async function DELETE(request, { params }) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  await prisma.promoCode.delete({ where: { id: params.id } });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

module.exports = { PATCH, DELETE };
