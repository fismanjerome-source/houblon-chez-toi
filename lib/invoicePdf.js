const PDFDocument = require('pdfkit').default || require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit').default || require('svg-to-pdfkit');
const { euros, orderLines } = require('./orderFormat');

const PINE = '#1B2E20';
const AMBER = '#C98A2E';
const COPPER = '#7A3B24';
const LINE = '#E4DCC5';

const HOP_SVG = `<svg viewBox="0 0 30 36" xmlns="http://www.w3.org/2000/svg">
  <path d="M15 2 C13 8, 13 12, 15 16" stroke="${PINE}" stroke-width="1.4" stroke-linecap="round" opacity="0.6" fill="none"/>
  <path d="M15 5 C8 5, 4 11, 4 18 C4 27, 9 33, 15 35 C21 33, 26 27, 26 18 C26 11, 22 5, 15 5Z" fill="${AMBER}" opacity="0.18"/>
  <path d="M15 8 C10.5 8, 7.5 12, 7.5 17.5" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M15 8 C19.5 8, 22.5 12, 22.5 17.5" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M15 13 C11 13, 8.5 16.5, 8.5 21" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M15 13 C19 13, 21.5 16.5, 21.5 21" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M15 18 C12 18, 10 20.8, 10 24.3" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M15 18 C18 18, 20 20.8, 20 24.3" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M15 23 C13 23, 11.5 25, 11.8 27.5" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M15 23 C17 23, 18.5 25, 18.2 27.5" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M15 5 C8 5, 4 11, 4 18 C4 27, 9 33, 15 35 C21 33, 26 27, 26 18 C26 11, 22 5, 15 5Z" stroke="${PINE}" stroke-width="1.3" fill="none"/>
</svg>`;

function buildInvoicePdf({ order, invoice, user }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    // En-tête : logo + nom
    SVGtoPDF(doc, HOP_SVG, left, 45, { width: 26, height: 31 });
    doc.font('Helvetica-Bold').fontSize(18).fillColor(PINE).text('Houblon chez toi', left + 34, 50);
    doc.font('Helvetica').fontSize(9).fillColor(COPPER).text('Bières artisanales françaises et belges', left + 34, 72);

    // Numéro / date, alignés à droite
    doc.font('Helvetica-Bold').fontSize(14).fillColor(PINE).text('FACTURE', left, 45, { width: pageWidth, align: 'right' });
    doc.font('Helvetica').fontSize(9.5).fillColor('#333')
      .text(`N° ${invoice.number}`, left, 66, { width: pageWidth, align: 'right' })
      .text(`Émise le ${invoice.issuedAt.toLocaleDateString('fr-FR')}`, left, 79, { width: pageWidth, align: 'right' })
      .text(`Commande n°${order.id.slice(-6)}`, left, 92, { width: pageWidth, align: 'right' });

    doc.moveTo(left, 115).lineTo(left + pageWidth, 115).strokeColor(LINE).lineWidth(1).stroke();

    // Émetteur / Client
    const colWidth = pageWidth / 2 - 10;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COPPER).text('ÉMETTEUR', left, 130);
    doc.font('Helvetica').fontSize(9.5).fillColor('#222').text(
      'Houblon chez toi\n984 Avenue du Général de Gaulle\n59910 Bondues, France\ncontact@houbloncheztoi.fr — 06 08 12 91 45\nEntreprise en cours d\'immatriculation — SIRET à venir\nTVA non applicable, art. 293 B du CGI',
      left, 144, { width: colWidth, lineGap: 2 }
    );

    doc.font('Helvetica-Bold').fontSize(9).fillColor(COPPER).text('CLIENT', left + colWidth + 20, 130);
    doc.font('Helvetica').fontSize(9.5).fillColor('#222').text(
      `${user.name}\n${order.pickup ? 'Retrait à Bondues' : order.town}`,
      left + colWidth + 20, 144, { width: colWidth, lineGap: 2 }
    );

    // Tableau des lignes
    const lines = orderLines(order);
    let y = 235;
    doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor(LINE).stroke();
    y += 8;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(COPPER);
    doc.text('DÉSIGNATION', left, y);
    doc.text('MONTANT', left, y, { width: pageWidth, align: 'right' });
    y += 16;
    doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor(LINE).stroke();
    y += 8;

    doc.font('Helvetica').fontSize(9.5).fillColor('#222');
    for (const line of lines) {
      doc.text(line.label, left, y, { width: pageWidth - 90 });
      doc.text(euros(line.amount), left, y, { width: pageWidth, align: 'right' });
      y += 18;
    }

    y += 4;
    doc.moveTo(left, y).lineTo(left + pageWidth, y).strokeColor(LINE).stroke();
    y += 10;

    function totalRow(label, value, bold) {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 11 : 9.5).fillColor(bold ? PINE : '#222');
      doc.text(label, left, y, { width: pageWidth - 100, align: 'right' });
      doc.text(value, left, y, { width: pageWidth, align: 'right' });
      y += bold ? 20 : 16;
    }

    if (order.deliveryFeeCents > 0) totalRow('Livraison', euros(order.deliveryFeeCents));
    if (order.depositChargedCents > 0) totalRow('Consignes', euros(order.depositChargedCents));
    if (order.discountCents > 0) totalRow('Remise volume pro', `- ${euros(order.discountCents)}`);
    if (order.promoDiscountCents > 0) totalRow(`Code ${order.promoCode || ''}`, `- ${euros(order.promoDiscountCents)}`);
    if (order.creditUsedCents > 0) totalRow('Crédit utilisé', `- ${euros(order.creditUsedCents)}`);
    if (order.depositReturnedCents > 0) totalRow('Reprise de consignes', `- ${euros(order.depositReturnedCents)}`);
    totalRow(invoice.dueDate ? 'Total dû' : 'Total payé', euros(invoice.totalCents), true);

    // Pied de page
    const paymentNote = invoice.dueDate
      ? `Facture à régler avant le ${invoice.dueDate.toLocaleDateString('fr-FR')} (paiement à 30 jours, compte pro).`
      : order.paymentChoice === 'STRIPE'
      ? 'Réglé par carte au moment de la commande. Merci de votre confiance !'
      : 'Réglé en espèces à la livraison ou au retrait. Merci de votre confiance !';
    const footerY = doc.page.height - doc.page.margins.bottom - 70;
    doc.moveTo(left, footerY).lineTo(left + pageWidth, footerY).strokeColor(LINE).stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('#666').text(
      `${paymentNote}\n` +
      "L'abus d'alcool est dangereux pour la santé, à consommer avec modération. Vente interdite aux mineurs de moins de 18 ans.",
      left, footerY + 10, { width: pageWidth, align: 'center', lineGap: 3 }
    );

    doc.end();
  });
}

module.exports = { buildInvoicePdf };
