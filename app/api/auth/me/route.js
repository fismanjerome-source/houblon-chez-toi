const { prisma } = require('../../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../../lib/auth');

async function GET(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const session = match && verifySessionToken(match[1]);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  return new Response(JSON.stringify({ name: user.name, email: user.email, isAdmin: user.isAdmin, proApproved: user.proApproved }), { status: 200 });
}

module.exports = { GET };
