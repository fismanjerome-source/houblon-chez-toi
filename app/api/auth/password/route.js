const bcrypt = require('bcryptjs');
const { prisma } = require('../../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../../lib/auth');

async function PATCH(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const session = match && verifySessionToken(match[1]);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  if (!newPassword || newPassword.length < 8) {
    return new Response(JSON.stringify({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' }), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const valid = await bcrypt.compare(currentPassword || '', user.passwordHash);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Mot de passe actuel incorrect' }), { status: 401 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

module.exports = { PATCH };
