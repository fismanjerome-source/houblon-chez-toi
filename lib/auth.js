const jwt = require('jsonwebtoken');

const SESSION_COOKIE = 'hct_session';
const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

function createSessionToken(user) {
  return jwt.sign(
    { userId: user.id, isAdmin: user.isAdmin },
    SECRET,
    { expiresIn: '30d' }
  );
}

function verifySessionToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

function sessionCookieHeader(token) {
  // httpOnly + secure : le cookie n'est jamais lisible par du JS côté client,
  // ce qui protège contre le vol de session par un script malveillant.
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

function clearSessionCookieHeader() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0`;
}

module.exports = {
  SESSION_COOKIE,
  createSessionToken,
  verifySessionToken,
  sessionCookieHeader,
  clearSessionCookieHeader,
};
