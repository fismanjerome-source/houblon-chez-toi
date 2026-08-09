const bcrypt = require('bcryptjs');
const { prisma } = require('../../../../lib/db');
const { createSessionToken, sessionCookieHeader } = require('../../../../lib/auth');

async function POST(request) {
  const body = await request.json();
  const { name, email, password, town, accountType, companyName } = body;

  if (!name || !email || !password || !town) {
    return new Response(JSON.stringify({ error: 'Champs manquants' }), { status: 400 });
  }
  if (password.length < 8) {
    return new Response(JSON.stringify({ error: 'Le mot de passe doit faire au moins 8 caractères' }), { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return new Response(JSON.stringify({ error: 'Un compte existe déjà avec cet email' }), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      town,
      accountType: accountType === 'professionnel' ? 'PROFESSIONNEL' : 'PARTICULIER',
      companyName: companyName || null,
    },
  });

  const token = createSessionToken(user);
  return new Response(JSON.stringify({ name: user.name, email: user.email }), {
    status: 201,
    headers: { 'Set-Cookie': sessionCookieHeader(token), 'Content-Type': 'application/json' },
  });
}

module.exports = { POST };
