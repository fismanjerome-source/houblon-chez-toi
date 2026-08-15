const { prisma } = require('./db');
const { sendEmail } = require('./email');
const { invoiceEmail } = require('./emailTemplates');
const { nextInvoiceNumber } = require('./invoiceNumber');
const { buildInvoicePdf } = require('./invoicePdf');

const VALID_STATUSES = ['EN_ATTENTE_PAIEMENT', 'EN_PREPARATION', 'EN_LIVRAISON', 'LIVREE', 'ANNULEE'];

// Applique un changement de statut de commande, avec les effets de bord associés
// (facture + email à la livraison, crédit de parrainage). Partagé entre la route
// admin (PATCH /api/admin/orders/[id]) et le webhook Telegram (boutons d'action).
async function applyOrderStatusChange(orderId, status) {
  if (!VALID_STATUSES.includes(status)) {
    return { error: 'Statut invalide', code: 400 };
  }

  const previous = await prisma.order.findUnique({ where: { id: orderId } });
  if (!previous) {
    return { error: 'Commande introuvable', code: 404 };
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { beer: true, glass: true } }, extras: true, user: true },
  });

  if (status === 'LIVREE' && previous.status !== 'LIVREE') {
    let invoice = await prisma.invoice.findUnique({ where: { orderId: order.id } });
    if (!invoice) {
      const number = await nextInvoiceNumber(prisma);
      const issuedAt = new Date();
      const isNet30 = order.paymentChoice === 'NET_30';
      invoice = await prisma.invoice.create({
        data: {
          orderId: order.id,
          number,
          totalCents: order.totalCents,
          issuedAt,
          dueDate: isNet30 ? new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
          paidAt: isNet30 ? null : (order.paidAt || issuedAt),
        },
      });
    }
    const pdfBuffer = await buildInvoicePdf({ order, invoice, user: order.user });
    const content = invoiceEmail({ order, user: order.user, invoice });
    await sendEmail({
      to: order.user.email,
      subject: content.subject,
      html: content.html,
      attachments: [{ filename: `facture-${invoice.number}.pdf`, content: pdfBuffer }],
    });

    const referral = await prisma.referral.findUnique({ where: { refereeId: order.userId } });
    if (referral && referral.status === 'PENDING' && referral.orderId === order.id) {
      await prisma.$transaction([
        prisma.user.update({ where: { id: referral.referrerId }, data: { creditCents: { increment: referral.rewardCents } } }),
        prisma.referral.update({ where: { id: referral.id }, data: { status: 'COMPLETED', completedAt: new Date() } }),
      ]);
    }
  }

  return { order };
}

module.exports = { VALID_STATUSES, applyOrderStatusChange };
