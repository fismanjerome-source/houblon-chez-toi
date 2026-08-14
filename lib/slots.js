const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const ORDER_CUTOFF_HOUR = 15; // commande passée avant 15h : livraison possible dès le jour même
const SLOTS_COUNT = 8;

function formatDate(d) {
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

// Livraison du lundi au vendredi (soir) et le samedi (matin) — jamais le dimanche.
function isDeliveryDay(d) {
  return d.getDay() !== 0;
}

function slotLabelForDay(d) {
  return d.getDay() === 6 ? `${formatDate(d)}, 10h–12h` : `${formatDate(d)}, 18h–19h30`;
}

// Créneaux de livraison : lundi-vendredi 18h-19h30 et samedi 10h-12h.
// Commande avant 15h -> jour même possible ; après 15h -> à partir du lendemain ;
// le dimanche n'étant pas un jour de livraison, le prochain créneau est le lundi.
function getUpcomingSlots() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (now.getHours() >= ORDER_CUTOFF_HOUR) {
    start.setDate(start.getDate() + 1);
  }

  const slots = [];
  const cursor = new Date(start);
  while (slots.length < SLOTS_COUNT) {
    if (isDeliveryDay(cursor)) {
      slots.push(slotLabelForDay(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}

module.exports = { getUpcomingSlots, ORDER_CUTOFF_HOUR };
