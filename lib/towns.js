// Communes desservies, avec code postal.
const TOWNS = [
  { name: 'Bondues', postalCode: '59910' },
  { name: 'Linselles', postalCode: '59126' },
  { name: 'Mouvaux', postalCode: '59420' },
  { name: 'Bousbecques', postalCode: '59166' },
  { name: 'Marcq-en-Barœul', postalCode: '59700' },
  { name: 'Wasquehal', postalCode: '59290' },
  { name: 'Roncq', postalCode: '59223' },
  { name: 'Comines', postalCode: '59560' },
  { name: 'Neuville-en-Ferrain', postalCode: '59960' },
  { name: 'Marquette-lez-Lille', postalCode: '59520' },
  { name: 'Wambrechies', postalCode: '59118' },
];

const TOWN_NAMES = TOWNS.map((t) => t.name);

function townLabel(name) {
  const t = TOWNS.find((x) => x.name === name);
  return t ? `${t.name} (${t.postalCode})` : name;
}

module.exports = { TOWNS, TOWN_NAMES, townLabel };
