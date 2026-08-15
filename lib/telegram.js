const { prisma } = require('./db');

// N'interrompt jamais le flux appelant : une commande ou une action admin ne
// doit jamais échouer parce qu'une notification Telegram n'a pas pu partir.
function getApiBase() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return null;
  return `https://api.telegram.org/bot${token}`;
}

async function callTelegram(method, payload) {
  const base = getApiBase();
  if (!base) {
    console.warn(`[telegram] TELEGRAM_BOT_TOKEN absente — appel "${method}" ignoré.`);
    return { skipped: true };
  }
  try {
    const res = await fetch(`${base}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) console.error(`[telegram] Échec "${method}":`, data.description);
    return data;
  } catch (err) {
    console.error(`[telegram] Erreur réseau "${method}":`, err);
    return { error: err };
  }
}

async function sendTelegramMessage(chatId, text, { replyMarkup } = {}) {
  return callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
  });
}

async function editTelegramMessage(chatId, messageId, text, { replyMarkup } = {}) {
  return callTelegram('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
  });
}

async function answerCallbackQuery(callbackQueryId, text) {
  return callTelegram('answerCallbackQuery', { callback_query_id: callbackQueryId, text, show_alert: false });
}

// Diffuse un message à tous les admins enregistrés (via /start <code>).
// Retourne les {chatId, messageId} pour permettre d'éditer les messages ensuite.
async function notifyAdmins(text, { replyMarkup } = {}) {
  if (!getApiBase()) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN absente — notification admin ignorée.');
    return [];
  }
  const subscribers = await prisma.telegramSubscriber.findMany();
  const results = [];
  for (const sub of subscribers) {
    const res = await sendTelegramMessage(sub.chatId, text, { replyMarkup });
    if (res && res.ok) results.push({ chatId: sub.chatId, messageId: res.result.message_id });
  }
  return results;
}

module.exports = { sendTelegramMessage, editTelegramMessage, answerCallbackQuery, notifyAdmins, getApiBase };
