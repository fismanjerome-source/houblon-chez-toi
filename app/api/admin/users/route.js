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

  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    orderBy: { name: 'asc' },
  });
  return new Response(JSON.stringify(users), { status: 200 });
}

async function PATCH(request) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const { users } = await request.json();
  if (!Array.isArray(users)) {
    return new Response(JSON.stringify({ error: 'Format invalide' }), { status: 400 });
  }

  for (const u of users) {
    await prisma.user.update({ where: { id: u.id }, data: { proApproved: !!u.proApproved } });
  }

  const updated = await prisma.user.findMany({ where: { isAdmin: false }, orderBy: { name: 'asc' } });
  return new Response(JSON.stringify(updated), { status: 200 });
}

module.exports = { GET, PATCH };
