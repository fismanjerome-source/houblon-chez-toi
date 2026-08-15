const { notifyAdmins } = require('./telegram');

const STATUS_LABELS = {
  EN_ATTENTE_PAIEMENT: 'En attente de paiement',
  EN_PREPARATION: 'En préparation',
  EN_LIVRAISON: 'En livraison',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
};

const PAYMENT_LABELS = {
  CASH_ON_DELIVERY: 'Espèces à la livraison',
  NET_30: 'Compte pro (30j)',
  STRIPE: 'Carte (Stripe)',
};

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatOrderSummary(order) {
  const lines = order.items.map((i) => {
    const glass = i.glass ? ` + ${escapeHtml(i.glass.name)}` : '';
    return `• ${i.quantity} × ${escapeHtml(i.beer.name)} (${i.format}cl)${glass}`;
  });
  for (const extra of order.extras || []) {
    lines.push(`• ${extra.quantity} × ${escapeHtml(extra.name)}`);
  }
  const where = order.pickup ? 'Retrait à Bondues' : `Livraison — ${escapeHtml(order.town)}`;
  return [
    `🍺 <b>Commande n°${order.id.slice(-6)}</b>`,
    `${escapeHtml(order.user.name)} (${escapeHtml(order.user.email)})`,
    where,
    `Créneau : ${escapeHtml(order.slot)}`,
    '',
    ...lines,
    '',
    `Total : ${(order.totalCents / 100).toFixed(2)} €`,
    `Paiement : ${PAYMENT_LABELS[order.paymentChoice] || order.paymentChoice}`,
    `Statut : ${STATUS_LABELS[order.status] || order.status}`,
  ].join('\n');
}

// Boutons proposant uniquement les transitions de statut pertinentes depuis le statut actuel.
function orderStatusButtons(orderId, currentStatus) {
  const transitions = {
    EN_PREPARATION: [['EN_LIVRAISON', '🚚 En livraison'], ['LIVREE', '✅ Livrée'], ['ANNULEE', '❌ Annuler']],
    EN_LIVRAISON: [['LIVREE', '✅ Livrée'], ['ANNULEE', '❌ Annuler']],
  };
  const buttons = transitions[currentStatus];
  if (!buttons || !buttons.length) return undefined;
  return { inline_keyboard: [buttons.map(([status, label]) => ({ text: label, callback_data: `order:${orderId}:${status}` }))] };
}

async function notifyNewOrder(order) {
  const text = `🆕 <b>Nouvelle commande</b>\n\n${formatOrderSummary(order)}`;
  return notifyAdmins(text, { replyMarkup: orderStatusButtons(order.id, order.status) });
}

async function notifyPaymentConfirmed(order) {
  const text = `💳 <b>Paiement Stripe confirmé</b>\n\n${formatOrderSummary(order)}`;
  return notifyAdmins(text, { replyMarkup: orderStatusButtons(order.id, order.status) });
}

async function notifyNewReview(review) {
  const stars = '⭐'.repeat(review.rating);
  const text = [
    '📝 <b>Nouvel avis client</b>',
    `${escapeHtml(review.customerName)} — ${stars}`,
    review.comment ? `« ${escapeHtml(review.comment)} »` : '(sans commentaire)',
  ].join('\n');
  return notifyAdmins(text);
}

async function notifyProRequest(user) {
  const text = [
    '🏢 <b>Nouvelle demande de compte PRO</b>',
    `${escapeHtml(user.name)} (${escapeHtml(user.email)})`,
    user.companyName ? `Société : ${escapeHtml(user.companyName)}` : '',
    `Ville : ${escapeHtml(user.town)}`,
  ].filter(Boolean).join('\n');
  const replyMarkup = { inline_keyboard: [[{ text: '✅ Approuver', callback_data: `pro:${user.id}:approve` }]] };
  return notifyAdmins(text, { replyMarkup });
}

module.exports = {
  STATUS_LABELS,
  formatOrderSummary,
  orderStatusButtons,
  notifyNewOrder,
  notifyPaymentConfirmed,
  notifyNewReview,
  notifyProRequest,
};
