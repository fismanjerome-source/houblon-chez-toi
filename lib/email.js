const { Resend } = require('resend');

// Adresse d'envoi de test Resend — délivrable uniquement à l'adresse email du
// compte Resend lui-même tant qu'aucun domaine n'est vérifié. À remplacer par
// une adresse @houbloncheztoi.fr dès qu'un domaine est vérifié dans Resend.
const EMAIL_FROM = 'Houblon chez toi <onboarding@resend.dev>';

let client = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

// N'interrompt jamais le flux appelant : une commande ou une action admin ne
// doit jamais échouer parce qu'un email n'a pas pu partir.
async function sendEmail({ to, subject, html, scheduledAt, attachments }) {
  const resend = getClient();
  if (!resend) {
    console.warn(`[email] RESEND_API_KEY absente — email "${subject}" à ${to} non envoyé.`);
    return { skipped: true };
  }
  try {
    const result = await resend.emails.send({ from: EMAIL_FROM, to, subject, html, scheduledAt, attachments });
    if (result.error) console.error('[email] Resend error:', result.error);
    return result;
  } catch (err) {
    console.error('[email] Échec envoi email:', err);
    return { error: err };
  }
}

module.exports = { sendEmail, EMAIL_FROM };
