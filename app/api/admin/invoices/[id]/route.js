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

  const { paid } = await request.json();

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: { paidAt: paid ? new Date() : null },
  });

  return new Response(JSON.stringify(invoice), { status: 200 });
}

module.exports = { PATCH };
