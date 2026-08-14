const { prisma } = require('../../../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../../../lib/auth');
const { buildInvoicePdf } = require('../../../../../lib/invoicePdf');

function getSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  return verifySessionToken(match[1]);
}

async function GET(request, { params }) {
  const session = getSession(request);
  if (!session) return new Response(JSON.stringify({ error: 'Non connecté' }), { status: 401 });

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: { items: { include: { beer: true, glass: true } }, extras: true, user: true },
      },
    },
  });
  if (!invoice) return new Response(JSON.stringify({ error: 'Facture introuvable' }), { status: 404 });

  const isOwner = invoice.order.userId === session.userId;
  if (!session.isAdmin && !isOwner) {
    return new Response(JSON.stringify({ error: 'Accès réservé' }), { status: 403 });
  }

  const pdfBuffer = await buildInvoicePdf({ order: invoice.order, invoice, user: invoice.order.user });

  return new Response(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="facture-${invoice.number}.pdf"`,
    },
  });
}

module.exports = { GET };
