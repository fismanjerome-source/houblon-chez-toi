const { euros, orderLines } = require('./orderFormat');

const SITE_URL = process.env.SITE_URL || 'https://houblon-chez-toi-kohl.vercel.app';

const COLORS = { pine: '#1B2E20', paper: '#F3ECD8', paperWarm: '#ECE2C6', amber: '#C98A2E', copper: '#7A3B24', line: 'rgba(15,23,18,0.14)' };

function baseLayout({ title, preheader, bodyHtml }) {
  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title}</title></head>
<body style="margin:0; padding:0; background:${COLORS.paper}; font-family: Georgia, 'Times New Roman', serif; color: ${COLORS.pine};">
  <span style="display:none; max-height:0; overflow:hidden;">${preheader || ''}</span>
  <div style="max-width:520px; margin:0 auto; padding:32px 20px;">
    <div style="text-align:center; margin-bottom:24px;">
      <span style="font-family: 'Courier New', monospace; font-size:11px; letter-spacing:0.12em; color:${COLORS.copper}; text-transform:uppercase;">Houblon chez toi</span>
    </div>
    <div style="background:#ffffff; border:1px solid ${COLORS.line}; border-radius:8px; padding:28px 24px;">
      ${bodyHtml}
    </div>
    <p style="text-align:center; font-size:12px; color:rgba(15,23,18,0.55); margin-top:20px;">
      Houblon chez toi — 984 Avenue du Général de Gaulle, 59910 Bondues<br />
      06 08 12 91 45 · contact@houbloncheztoi.fr<br />
      L'abus d'alcool est dangereux pour la santé, à consommer avec modération.
    </p>
  </div>
</body>
</html>`;
}

function linesTable(lines) {
  return `<table role="presentation" width="100%" style="border-collapse:collapse; font-size:14px; margin:16px 0;">
    ${lines.map((l) => `<tr><td style="padding:6px 0; border-bottom:1px solid ${COLORS.line};">${l.label}</td><td style="padding:6px 0; border-bottom:1px solid ${COLORS.line}; text-align:right; white-space:nowrap;">${euros(l.amount)}</td></tr>`).join('')}
  </table>`;
}

function orderConfirmationEmail({ order, user }) {
  const lines = orderLines(order);
  const where = order.pickup ? 'Retrait à Bondues' : order.town;
  const body = `
    <h1 style="font-size:20px; margin:0 0 4px;">Merci ${user.name.split(' ')[0]}, votre commande est bien reçue !</h1>
    <p style="font-size:14px; line-height:1.6; color:rgba(15,23,18,0.75);">
      Commande n°${order.id.slice(-6)} — ${where} — ${order.slot}
    </p>
    ${linesTable(lines)}
    <table role="presentation" width="100%" style="font-size:14px; margin-top:8px;">
      ${order.deliveryFeeCents > 0 ? `<tr><td>Livraison</td><td style="text-align:right;">${euros(order.deliveryFeeCents)}</td></tr>` : ''}
      ${order.depositReturnedCents > 0 ? `<tr><td>Reprise de consignes</td><td style="text-align:right;">− ${euros(order.depositReturnedCents)}</td></tr>` : ''}
      <tr><td style="font-weight:bold; padding-top:8px;">Total</td><td style="text-align:right; font-weight:bold; padding-top:8px;">${euros(order.totalCents)}</td></tr>
    </table>
    <p style="font-size:13.5px; color:rgba(15,23,18,0.7); margin-top:20px;">
      Le règlement se fait en espèces à la livraison ou au retrait (le paiement en ligne arrive bientôt).
      Une question ? Répondez simplement à cet email ou écrivez-nous au 06 08 12 91 45.
    </p>
  `;
  return { subject: `Confirmation de votre commande — Houblon chez toi`, html: baseLayout({ title: 'Confirmation de commande', preheader: 'Votre commande Houblon chez toi est confirmée.', bodyHtml: body }) };
}

function invoiceEmail({ order, user, invoice }) {
  const lines = orderLines(order);
  const body = `
    <h1 style="font-size:20px; margin:0 0 4px;">Votre facture n°${invoice.number}</h1>
    <p style="font-size:14px; line-height:1.6; color:rgba(15,23,18,0.75);">
      Livrée le ${order.slot} ${order.pickup ? '(retrait à Bondues)' : `à ${order.town}`}. Le PDF de la facture est joint à cet email.
    </p>
    ${linesTable(lines)}
    <table role="presentation" width="100%" style="font-size:14px; margin-top:8px;">
      ${order.deliveryFeeCents > 0 ? `<tr><td>Livraison</td><td style="text-align:right;">${euros(order.deliveryFeeCents)}</td></tr>` : ''}
      ${order.depositChargedCents > 0 ? `<tr><td>Consignes</td><td style="text-align:right;">${euros(order.depositChargedCents)}</td></tr>` : ''}
      ${order.depositReturnedCents > 0 ? `<tr><td>Reprise de consignes</td><td style="text-align:right;">− ${euros(order.depositReturnedCents)}</td></tr>` : ''}
      <tr><td style="font-weight:bold; padding-top:8px;">Total payé</td><td style="text-align:right; font-weight:bold; padding-top:8px;">${euros(order.totalCents)}</td></tr>
    </table>
    <p style="font-size:13.5px; color:rgba(15,23,18,0.7); margin-top:20px;">Merci de votre confiance !</p>
  `;
  return { subject: `Votre facture n°${invoice.number} — Houblon chez toi`, html: baseLayout({ title: 'Facture', preheader: 'Voici la facture de votre commande livrée.', bodyHtml: body }) };
}

function reviewRequestEmail({ order, user, reviewUrl }) {
  const body = `
    <h1 style="font-size:20px; margin:0 0 4px;">Alors, qu'en avez-vous pensé ?</h1>
    <p style="font-size:14px; line-height:1.7; color:rgba(15,23,18,0.8);">
      Bonjour ${user.name.split(' ')[0]}, votre commande n°${order.id.slice(-6)} du ${order.slot} nous tient à cœur.
      Une minute pour nous laisser une note et un mot ? Ça nous aide énormément, et ça reste entre nous et vous — sincère.
    </p>
    <div style="text-align:center; margin:24px 0;">
      <a href="${reviewUrl}" style="display:inline-block; background:${COLORS.pine}; color:${COLORS.paper}; text-decoration:none; padding:12px 28px; border-radius:4px; font-size:14px;">Laisser un avis</a>
    </div>
    <p style="font-size:13px; color:rgba(15,23,18,0.6);">Ça prend 30 secondes, promis.</p>
  `;
  return { subject: `Votre avis nous intéresse — Houblon chez toi`, html: baseLayout({ title: 'Donnez votre avis', preheader: 'Une minute pour nous dire ce que vous en avez pensé ?', bodyHtml: body }) };
}

module.exports = { orderConfirmationEmail, invoiceEmail, reviewRequestEmail, SITE_URL };
