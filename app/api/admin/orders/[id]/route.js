const { prisma } = require('../../../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../../../lib/auth');
const { sendEmail } = require('../../../../../lib/email');
const { invoiceEmail } = require('../../../../../lib/emailTemplates');
const { nextInvoiceNumber } = require('../../../../../lib/invoiceNumber');
const { buildInvoicePdf } = require('../../../../../lib/invoicePdf');

const VALID_STATUSES = ['EN_PREPARATION', 'EN_LIVRAISON', 'LIVREE', 'ANNULEE'];

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
      invoice = await prisma.invoice.create({ data: { orderId: order.id, number, totalCents: order.totalCents } });
    }
    const pdfBuffer = await buildInvoicePdf({ order, invoice, user: order.user });
    const content = invoiceEmail({ order, user: order.user, invoice });
    await sendEmail({
      to: order.user.email,
      subject: content.subject,
      html: content.html,
      attachments: [{ filename: `facture-${invoice.number}.pdf`, content: pdfBuffer }],
    });
  }

  return new Response(JSON.stringify(order), { status: 200 });
}

module.exports = { PATCH };
