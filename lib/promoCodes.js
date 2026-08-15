// Résout un code saisi à la commande : soit le code de parrainage d'un autre
// client (remise "ami", 1ère commande uniquement), soit un code promo classique.
async function resolveCode(prisma, rawCode, user) {
  if (!rawCode || !rawCode.trim()) return null;
  const code = rawCode.trim().toUpperCase();

  const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
  if (referrer) {
    if (referrer.id === user.id) return { error: 'Vous ne pouvez pas utiliser votre propre code.' };
    const priorOrders = await prisma.order.count({ where: { userId: user.id } });
    if (priorOrders > 0) return { error: "Ce code n'est valable que pour une première commande." };
    const alreadyReferred = await prisma.referral.findUnique({ where: { refereeId: user.id } });
    if (alreadyReferred) return { error: 'Un parrainage a déjà été enregistré pour votre compte.' };
    return { type: 'REFERRAL', referrerId: referrer.id, code, discountCents: 500 };
  }

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) return { error: 'Code invalide.' };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { error: 'Ce code a expiré.' };
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return { error: "Ce code a atteint sa limite d'utilisation." };
  if (promo.restrictToEmail && promo.restrictToEmail.toLowerCase() !== user.email.toLowerCase()) {
    return { error: "Ce code ne vous est pas destiné." };
  }
  return { type: 'PROMO', code, promo };
}

function computeCodeDiscountCents(resolved, discountableCents) {
  if (!resolved || resolved.error) return 0;
  if (resolved.type === 'REFERRAL') return Math.min(resolved.discountCents, discountableCents);
  const { promo } = resolved;
  const amount = promo.discountType === 'PERCENT'
    ? Math.round((discountableCents * promo.discountValue) / 100)
    : Math.round(promo.discountValue);
  return Math.max(0, Math.min(amount, discountableCents));
}

module.exports = { resolveCode, computeCodeDiscountCents };
