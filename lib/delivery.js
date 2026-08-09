const FREE_SHIPPING_THRESHOLD_CENTS = 4900;
const DELIVERY_FEE_CENTS = 490;
const PICKUP_ADDRESS = '984 Avenue du Général de Gaulle, Bondues';

function computeDeliveryFeeCents({ pickup, town, itemsTotalCents }) {
  if (pickup) return 0;
  if (town === 'Bondues') return 0;
  if (itemsTotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  return DELIVERY_FEE_CENTS;
}

module.exports = {
  FREE_SHIPPING_THRESHOLD_CENTS,
  DELIVERY_FEE_CENTS,
  PICKUP_ADDRESS,
  computeDeliveryFeeCents,
};
