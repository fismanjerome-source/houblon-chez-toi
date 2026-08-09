const bcrypt = require('bcryptjs');
const { prisma } = require('../../../../lib/db');
const { createSessionToken, sessionCookieHeader } = require('../../../../lib/auth');

async function POST(request) {
  const { email, password } = await request.json();
  const user = await prisma.user.findUnique({ where: { email } });

  // Message volontairement identique en cas d'email inconnu ou de mot de passe faux,
  // pour ne pas révéler quels emails sont inscrits.
  if (!user) {
    return new Response(JSON.stringify({ error: 'Email ou mot de passe incorrect' }), { status: 401 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Email ou mot de passe incorrect' }), { status: 401 });
  }

  const token = createSessionToken(user);
  return new Response(JSON.stringify({ name: user.name, email: user.email, isAdmin: user.isAdmin }), {
    status: 200,
    headers: { 'Set-Cookie': sessionCookieHeader(token), 'Content-Type': 'application/json' },
  });
}

module.exports = { POST };
