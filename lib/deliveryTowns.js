// Coordonnées approximatives des communes livrées, pour la carte de la zone de livraison.
// Bondues (siège) est traité à part dans app/components/DeliveryZoneMap.js.
const DELIVERY_TOWN_LOCATIONS = [
  { name: 'Linselles', lat: 50.7392, lng: 3.1092 },
  { name: 'Mouvaux', lat: 50.7025, lng: 3.1494 },
  { name: 'Bousbecques', lat: 50.7742, lng: 3.0783 },
  { name: 'Marcq-en-Barœul', lat: 50.6789, lng: 3.1128 },
  { name: 'Wasquehal', lat: 50.6853, lng: 3.1408 },
  { name: 'Roncq', lat: 50.7439, lng: 3.1231 },
  { name: 'Comines', lat: 50.7667, lng: 3.0167 },
  { name: 'Neuville-en-Ferrain', lat: 50.7597, lng: 3.1667 },
  { name: 'Marquette-lez-Lille', lat: 50.6622, lng: 3.0672 },
  { name: 'Wambrechies', lat: 50.6853, lng: 3.0533 },
  { name: 'Quesnoy-sur-Deûle', lat: 50.7383, lng: 3.0508 },
  { name: 'Wervicq-Sud', lat: 50.7742, lng: 3.0389 },
  { name: 'Tourcoing', lat: 50.7239, lng: 3.1611 },
];

module.exports = { DELIVERY_TOWN_LOCATIONS };
