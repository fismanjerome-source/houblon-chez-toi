// Remise volume réservée aux comptes pro validés (voir User.proApproved).
// Le palier applicable est le plus haut seuil atteint par le nombre total de
// bouteilles (format > 0) de la commande ; la remise porte sur le sous-total
// hors consignes (les consignes sont un dépôt remboursable, pas un prix de vente).
function computeVolumeDiscount({ totalBottles, discountableCents, tiers }) {
  const applicable = tiers
    .filter((t) => totalBottles >= t.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];
  if (!applicable) return { discountCents: 0, discountPercent: 0 };
  const discountCents = Math.round((discountableCents * applicable.discountPercent) / 100);
  return { discountCents, discountPercent: applicable.discountPercent };
}

module.exports = { computeVolumeDiscount };
