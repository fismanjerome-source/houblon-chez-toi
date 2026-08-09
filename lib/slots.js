const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function nextWeekday(fromDate, weekday) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7 || 7));
  return d;
}

function formatDate(d) {
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

// Créneaux de livraison : jeudi soir et samedi matin, sur les deux prochaines semaines.
function getUpcomingSlots() {
  const today = new Date();
  const slots = [];
  for (let week = 0; week < 2; week++) {
    const base = new Date(today);
    base.setDate(base.getDate() + week * 7);
    const thursday = nextWeekday(base, 4);
    const saturday = nextWeekday(base, 6);
    slots.push({ date: thursday, label: `${formatDate(thursday)}, 18h–19h30` });
    slots.push({ date: saturday, label: `${formatDate(saturday)}, 10h–12h` });
  }
  return slots.sort((a, b) => a.date - b.date).map((s) => s.label);
}

module.exports = { getUpcomingSlots };
