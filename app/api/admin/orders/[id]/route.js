const { prisma } = require('../../../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../../../lib/auth');
const { sendEmail } = require('../../../../../lib/email');
const { invoiceEmail } = require('../../../../../lib/emailTemplates');
const { nextInvoiceNumber } = require('../../../../../lib/invoiceNumber');
const { buildInvoicePdf } = require('../../../../../lib/invoicePdf');

const VALID_STATUSES = ['EN_ATTENTE_PAIEMENT', 'EN_PREPARATION', 'EN_LIVRAISON', 'LIVREE', 'ANNULEE'];

function getAdminSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  const session = verifySessionToken(match[1]);
  return session && session.isAdmin ? session : null;
}

async function PATCH(request, { params }) {
  const session = getAdminSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });

  const { status } = await request.json();
  if (!VALID_STATUSES.includes(status)) {
    return new Response(JSON.stringify({ error: 'Statut invalide' }), { status: 400 });
  }

  const previous = await prisma.order.findUnique({ where: { id: params.id } });
  if (!previous) return new Response(JSON.stringify({ error: 'Commande introuvable' }), { status: 404 });

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status },
    include: { items: { include: { beer: true, glass: true } }, extras: true, user: true },
  });

  if (status === 'LIVREE' && previous.status !== 'LIVREE') {
    let invoice = await prisma.invoice.findUnique({ where: { orderId: order.id } });
    if (!invoice) {
      const number = await nextInvoiceNumber(prisma);
      const issuedAt = new Date();
      // Déjà réglée par carte (Stripe) : facture soldée. Compte pro à 30 jours :
      // échéance différée. Sinon (espèces) : réglée au moment de la livraison.
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

    // Parrainage : la commande livrée est celle du filleul -> on crédite le parrain.
    const referral = await prisma.referral.findUnique({ where: { refereeId: order.userId } });
    if (referral && referral.status === 'PENDING' && referral.orderId === order.id) {
      await prisma.$transaction([
        prisma.user.update({ where: { id: referral.referrerId }, data: { creditCents: { increment: referral.rewardCents } } }),
        prisma.referral.update({ where: { id: referral.id }, data: { status: 'COMPLETED', completedAt: new Date() } }),
      ]);
    }
  }

  return new Response(JSON.stringify(order), { status: 200 });
}

module.exports = { PATCH };
