// Coordonnées approximatives des brasseries, pour la carte "d'où viennent nos bières".
const BREWERY_LOCATIONS = [
  {
    town: 'Merville (Nord)',
    lat: 50.6467,
    lng: 2.6467,
    country: 'FR',
    beerNames: ['Anosteke Blonde', 'Anosteke NEIPA', 'Anosteke Saison'],
  },
  {
    town: 'Saint-Sylvestre-Cappel (Nord)',
    lat: 50.7333,
    lng: 2.5333,
    country: 'FR',
    beerNames: ['3 Monts IPA', '3 Monts Blonde', '3 Monts Ambrée', '3 Monts Saison', '3 Monts Triple'],
  },
  {
    town: 'Ploegsteert (Belgique)',
    lat: 50.7167,
    lng: 2.8833,
    country: 'BE',
    beerNames: ['Queue de Charrue Triple', 'Queue de Charrue IPA', 'Queue de Charrue Blonde', 'Queue de Charrue Brune'],
  },
  {
    town: 'Bissegem (Belgique)',
    lat: 50.8256,
    lng: 3.2306,
    country: 'BE',
    beerNames: ['Ypra Triple'],
  },
  {
    town: 'Péruwelz (Belgique)',
    lat: 50.5167,
    lng: 3.5833,
    country: 'BE',
    beerNames: ['Paix Dieu'],
  },
  {
    town: 'Achouffe (Belgique)',
    lat: 50.1667,
    lng: 5.65,
    country: 'BE',
    beerNames: ['Chouffe'],
  },
  {
    town: 'Buggenhout (Belgique)',
    lat: 51.0167,
    lng: 4.2,
    country: 'BE',
    beerNames: ['Tripel Karmeliet'],
  },
  {
    town: 'Dinant (Belgique)',
    lat: 50.2606,
    lng: 4.9119,
    country: 'BE',
    beerNames: ['Leffe Blonde'],
  },
  {
    town: 'Ennevelin (Nord)',
    lat: 50.5333,
    lng: 3.1167,
    country: 'FR',
    beerNames: ['PVL Blonde', 'PVL Triple', 'PVL Ambrée'],
  },
];

// Notre siège — le point de départ de Houblon chez toi.
const HQ_LOCATION = { town: 'Bondues', lat: 50.6975, lng: 3.1189, address: '984 Avenue du Général de Gaulle, Bondues' };

module.exports = { BREWERY_LOCATIONS, HQ_LOCATION };
