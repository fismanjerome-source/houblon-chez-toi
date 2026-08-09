const { clearSessionCookieHeader } = require('../../../../lib/auth');

async function POST() {
  return new Response(null, {
    status: 204,
    headers: { 'Set-Cookie': clearSessionCookieHeader() },
  });
}

module.exports = { POST };
