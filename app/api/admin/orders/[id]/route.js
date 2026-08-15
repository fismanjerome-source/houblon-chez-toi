const { verifySessionToken, SESSION_COOKIE } = require('../../../../../lib/auth');
const { applyOrderStatusChange } = require('../../../../../lib/orderStatus');

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

  const { status } = await request.json();
  const { order, error, code } = await applyOrderStatusChange(params.id, status);
  if (error) return new Response(JSON.stringify({ error }), { status: code });

  return new Response(JSON.stringify(order), { status: 200 });
}

module.exports = { PATCH };
