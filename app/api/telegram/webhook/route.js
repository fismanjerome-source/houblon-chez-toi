const { prisma } = require('../../../../lib/db');
const { sendTelegramMessage, editTelegramMessage, answerCallbackQuery } = require('../../../../lib/telegram');
const { applyOrderStatusChange } = require('../../../../lib/orderStatus');
const { STATUS_LABELS, formatOrderSummary, orderStatusButtons } = require('../../../../lib/telegramNotify');

async function POST(request) {
  const update = await request.json().catch(() => null);
  if (!update) return new Response(JSON.stringify({ ok: true }), { status: 200 });

  if (update.message && typeof update.message.text === 'string') {
    await handleMessage(update.message);
  } else if (update.callback_query) {
    await handleCallback(update.callback_query);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

async function handleMessage(message) {
  const chatId = String(message.chat.id);
  const text = message.text.trim();

  if (!text.startsWith('/start')) {
    await sendTelegramMessage(chatId, "Commande non reconnue. Utilise /start <code> pour t'enregistrer.");
    return;
  }

  const code = text.split(' ')[1];
  const setupCode = process.env.TELEGRAM_SETUP_CODE;
  if (!setupCode) {
    await sendTelegramMessage(chatId, "Le bot n'est pas encore configuré côté serveur (code d'enregistrement manquant).");
    return;
  }
  if (code !== setupCode) {
    await sendTelegramMessage(chatId, "Code d'enregistrement invalide. Utilise /start <ton-code>.");
    return;
  }

  const label = [message.chat.first_name, message.chat.last_name].filter(Boolean).join(' ') || message.chat.username || null;
  await prisma.telegramSubscriber.upsert({
    where: { chatId },
    update: { label },
    create: { chatId, label },
  });
  await sendTelegramMessage(chatId, '✅ Connecté ! Tu recevras ici les notifications de Houblon chez toi : nouvelles commandes, paiements confirmés, avis clients et demandes de compte pro.');
}

async function handleCallback(callback) {
  const chatId = String(callback.message.chat.id);
  const messageId = callback.message.message_id;
  const data = callback.data || '';

  const subscriber = await prisma.telegramSubscriber.findUnique({ where: { chatId } });
  if (!subscriber) {
    await answerCallbackQuery(callback.id, "Tu n'es pas enregistré comme admin.");
    return;
  }

  const [kind, ...rest] = data.split(':');

  if (kind === 'order') {
    const [orderId, status] = rest;
    const { order, error } = await applyOrderStatusChange(orderId, status);
    if (error) {
      await answerCallbackQuery(callback.id, error);
      return;
    }
    await answerCallbackQuery(callback.id, `Statut mis à jour : ${STATUS_LABELS[status] || status}`);
    await editTelegramMessage(chatId, messageId, formatOrderSummary(order), { replyMarkup: orderStatusButtons(order.id, order.status) });
    return;
  }

  if (kind === 'pro') {
    const [userId] = rest;
    await prisma.user.update({ where: { id: userId }, data: { proApproved: true } });
    await answerCallbackQuery(callback.id, 'Compte PRO approuvé ✅');
    await editTelegramMessage(chatId, messageId, `${callback.message.text}\n\n✅ Compte PRO approuvé.`);
    return;
  }

  await answerCallbackQuery(callback.id, 'Action inconnue.');
}

module.exports = { POST };
