const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const BEERS = [
  {
    name: 'Queue de Charrue',
    brewery: 'Vanuxeem',
    origin: 'Ploegsteert, Belgique',
    country: 'BE',
    abv: 9.0,
    price33: 2.6,
    price75: 5.6,
    description: "Triple blonde de 9%, refermentée en bouteille, à la mousse compacte et à l'amertume prolongée et équilibrée.",
    tastingNote: "Ronde et maltée, avec une pointe d'amertume houblonnée qui persiste en fin de bouche.",
    bottleImageUrl: '/beers/queue-de-charrue-triple-bouteille-verre.png',
  },
  {
    name: 'Anosteke Blonde',
    brewery: 'Brasserie du Pays Flamand',
    origin: 'Merville, Nord',
    country: 'FR',
    abv: 8.0,
    price33: 2.8,
    price75: 6.0,
    description: 'Blonde du Nord aux notes fleuries et fruitées.',
    tastingNote: 'Généreuse et fruitée, une belle rondeur en bouche.',
    bottleImageUrl: '/beers/anosteke-blonde-bouteille-clean.jpg',
  },
  {
    name: 'Anosteke NEIPA',
    brewery: 'Brasserie du Pays Flamand',
    origin: 'Merville, Nord',
    country: 'FR',
    abv: 5.6,
    price33: 0,
    price75: 6.0,
    description: "Blonde trouble, arômes puissants de fruits tropicaux et d'agrumes. Vendue en 75cl uniquement.",
    tastingNote: "Juteuse et parfumée, notes d'agrumes et de fruits tropicaux bien présentes.",
    bottleImageUrl: '/beers/anosteke-neipa-bouteille-clean.jpg',
  },
  {
    name: 'Anosteke Saison',
    brewery: 'Brasserie du Pays Flamand',
    origin: 'Merville, Nord',
    country: 'FR',
    abv: 6.0,
    price33: 2.8,
    price75: 6.0,
    description: 'Robe jaune doré, arômes de céréales, pain et notes florales.',
    tastingNote: "Vive et florale, parfaite pour l'apéritif.",
    bottleImageUrl: '/beers/anosteke-saison-bouteille.jpg',
  },
  {
    name: 'Queue de Charrue IPA',
    brewery: 'Vanuxeem',
    origin: 'Ploegsteert, Belgique',
    country: 'BE',
    abv: 5.9,
    price33: 2.6,
    price75: 5.6,
    description: 'Blonde légèrement trouble, dry-hopée au Mosaic, notes exotiques et fruitées.',
    tastingNote: 'Fraîche et fruitée, une amertume franche mais bien maîtrisée.',
    bottleImageUrl: '/beers/queue-de-charrue-ipa-bouteille-verre.png',
  },
  {
    name: 'Queue de Charrue Blonde',
    brewery: 'Vanuxeem',
    origin: 'Ploegsteert, Belgique',
    country: 'BE',
    abv: 6.6,
    price33: 2.6,
    price75: 5.6,
    description: 'Haute fermentation, arômes subtils de houblon, amertume équilibrée et parfum légèrement fruité.',
    tastingNote: 'Légère et désaltérante, parfum discret de houblon.',
    bottleImageUrl: '/beers/queue-de-charrue-blonde-bouteille.png',
  },
  {
    name: 'Queue de Charrue Brune',
    brewery: 'Vanuxeem',
    origin: 'Ploegsteert, Belgique',
    country: 'BE',
    abv: 5.4,
    price33: 2.6,
    price75: 5.6,
    description: 'Véritable bière rouge flamande, 18 mois en fûts de chêne, goût aigre-doux et fruité.',
    tastingNote: 'Surprenante par son acidité fruitée, à la finale légèrement sucrée.',
    bottleImageUrl: '/beers/queue-de-charrue-brune-bouteille-verre.png',
  },
  {
    name: 'Ypra Triple',
    brewery: 'Omer Vander Ghinste',
    origin: 'Bissegem, Belgique',
    country: 'BE',
    abv: 10.0,
    price33: 3.2,
    price75: 6.8,
    description: "Triple dorée à la mousse crémeuse, arômes houblonnés d'orange, mandarine et pamplemousse.",
    tastingNote: 'Ample et houblonnée, une belle complexité aromatique.',
    bottleImageUrl: '/beers/ypra-triple-bouteille-verre.png',
  },
  {
    name: '3 Monts IPA',
    brewery: 'Brasserie de Saint-Sylvestre',
    origin: 'Saint-Sylvestre-Cappel, Nord',
    country: 'FR',
    abv: 5.6,
    price33: 2.9,
    price75: 6.2,
    description: "Recette houblonnée aux houblons Callista et Sabro, notes de fruits exotiques et d'agrumes.",
    tastingNote: 'Fruits exotiques en bouche, amertume nette mais équilibrée.',
    bottleImageUrl: '/beers/3monts-ipa-bouteille.png',
  },
  {
    name: '3 Monts Blonde',
    brewery: 'Brasserie de Saint-Sylvestre',
    origin: 'Saint-Sylvestre-Cappel, Nord',
    country: 'FR',
    abv: 8.5,
    price33: 2.7,
    price75: 5.8,
    description: "L'iconique bière blonde or, limpide, notes de céréales et houblon herbacé, saveurs de malt et de fruit.",
    tastingNote: "Ronde et maltée, un classique du Nord qu'on apprécie particulièrement.",
    bottleImageUrl: '/beers/3monts-blonde-bouteille-verre.png',
  },
  {
    name: '3 Monts Ambrée',
    brewery: 'Brasserie de Saint-Sylvestre',
    origin: 'Saint-Sylvestre-Cappel, Nord',
    country: 'FR',
    abv: 7.5,
    price33: 2.9,
    price75: 6.2,
    description: 'Couleur cuivrée, notes de caramel, miel et pain toasté, saveurs de malts torréfiés.',
    tastingNote: 'Notes de caramel et de pain toasté, réconfortante.',
    bottleImageUrl: '/beers/3monts-ambree-bouteille.png',
  },
  {
    name: '3 Monts Saison',
    brewery: 'Brasserie de Saint-Sylvestre',
    origin: 'Saint-Sylvestre-Cappel, Nord',
    country: 'FR',
    abv: 6.5,
    price33: 2.7,
    price75: 5.8,
    description: "Blonde dorée et désaltérante, notes d'agrumes et de houblon frais.",
    tastingNote: 'Légère et rafraîchissante, agrumes en finale.',
    bottleImageUrl: '/beers/3monts-saison-bouteille.png',
  },
  {
    name: '3 Monts Triple',
    brewery: 'Brasserie de Saint-Sylvestre',
    origin: 'Saint-Sylvestre-Cappel, Nord',
    country: 'FR',
    abv: 9.5,
    price33: 3.1,
    price75: 6.6,
    description: 'Blonde orangée typée, notes de banane mûre, fruits à noyaux et pain, finale longue et épicée.',
    tastingNote: 'Généreuse, épicée, une belle longueur en bouche.',
    bottleImageUrl: '/beers/3monts-triple-bouteille.png',
  },
  {
    name: 'Paix Dieu',
    brewery: 'Brasserie Caulier',
    origin: 'Abbaye de Bonlieu, Belgique',
    country: 'BE',
    abv: 10.0,
    price33: 3.2,
    price75: 6.8,
    description: "Triple d'abbaye ronde et épicée.",
    tastingNote: 'Puissante et épicée, à savourer lentement.',
    bottleImageUrl: '/beers/paix-dieu-bouteille.png',
    isBeerOfMonth: true,
    learnMoreUrl: 'https://www.paixdieubeer.be/la-paix-dieu/',
    shortHistory: "Née en hommage à l'ancienne abbaye cistercienne de Paix-Dieu, cette triple est brassée par la Brasserie Caulier selon une recette qui marie rondeur et épices, dans la pure tradition des bières d'abbaye belges.",
  },
  {
    name: 'Chouffe',
    brewery: "Brasserie d'Achouffe",
    origin: 'Achouffe, Belgique',
    country: 'BE',
    abv: 8.0,
    price33: 3.0,
    price75: 6.4,
    description: 'Blonde emblématique des Ardennes belges.',
    tastingNote: 'Épicée et fruitée, un classique belge toujours agréable.',
    bottleImageUrl: '/beers/chouffe-bouteille.png',
  },
];

// Verres proposés par bière. Queue de Charrue propose 3 contenances au choix.
const GLASSES = {
  'Anosteke Blonde': [{ name: 'Verre ballon sculpté Anosteke', volumeCl: 33, price: 6.5 }],
  'Paix Dieu': [{ name: 'Verre demi-lune Paix Dieu', volumeCl: 33, price: 5.5, imageUrl: '/beers/paix-dieu-verre.webp' }],
  'Chouffe': [{ name: 'Verre ballon Chouffe', volumeCl: 33, price: 7.2, imageUrl: '/beers/chouffe-verre.png' }],
  '3 Monts IPA': [{ name: 'Verre 3 Monts', volumeCl: 33, price: 5.0, imageUrl: '/beers/3monts-ipa-verre.png' }],
  '3 Monts Ambrée': [{ name: 'Verre 3 Monts', volumeCl: 33, price: 5.0, imageUrl: '/beers/3monts-verre.png' }],
  '3 Monts Saison': [{ name: 'Verre 3 Monts', volumeCl: 33, price: 5.0, imageUrl: '/beers/3monts-verre.png' }],
  '3 Monts Triple': [{ name: 'Verre 3 Monts', volumeCl: 33, price: 5.0, imageUrl: '/beers/3monts-verre.png' }],
  'Queue de Charrue': [
    { name: 'Calice à pied Queue de Charrue', volumeCl: 25, price: 3.9 },
    { name: 'Calice à pied Queue de Charrue', volumeCl: 33, price: 4.9 },
    { name: 'Calice à pied Queue de Charrue', volumeCl: 50, price: 6.9 },
  ],
  'Queue de Charrue IPA': [
    { name: 'Calice à pied Queue de Charrue', volumeCl: 25, price: 3.9 },
    { name: 'Calice à pied Queue de Charrue', volumeCl: 33, price: 4.9 },
    { name: 'Calice à pied Queue de Charrue', volumeCl: 50, price: 6.9 },
  ],
  'Queue de Charrue Blonde': [
    { name: 'Calice à pied Queue de Charrue', volumeCl: 25, price: 3.9 },
    { name: 'Calice à pied Queue de Charrue', volumeCl: 33, price: 4.9 },
    { name: 'Calice à pied Queue de Charrue', volumeCl: 50, price: 6.9 },
  ],
  'Queue de Charrue Brune': [
    { name: 'Calice à pied Queue de Charrue', volumeCl: 25, price: 3.9 },
    { name: 'Calice à pied Queue de Charrue', volumeCl: 33, price: 4.9 },
    { name: 'Calice à pied Queue de Charrue', volumeCl: 50, price: 6.9 },
  ],
};

async function main() {
  for (const beerData of BEERS) {
    const existing = await prisma.beer.findFirst({ where: { name: beerData.name } });
    if (existing) continue;
    const beer = await prisma.beer.create({ data: beerData });
    const glasses = GLASSES[beerData.name];
    if (glasses) {
      await prisma.glass.createMany({ data: glasses.map((g) => ({ ...g, beerId: beer.id })) });
    }
  }

  // Consigne : 0,10€ par défaut sur les bières belges (aucune sur les françaises), 0,50€ pour Paix Dieu.
  await prisma.beer.updateMany({ where: { country: 'BE' }, data: { depositCents33: 10, depositCents75: 10 } });
  await prisma.beer.updateMany({ where: { name: 'Paix Dieu' }, data: { depositCents33: 50, depositCents75: 50 } });

  // Compte admin de démarrage — À CHANGER le mot de passe immédiatement après le premier déploiement
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@houbloncheztoi.fr' } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('change-moi-immediatement', 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@houbloncheztoi.fr',
        passwordHash,
        town: 'Bondues',
        isAdmin: true,
      },
    });
  }

  console.log('Seed terminé.');
}

main().finally(() => prisma.$disconnect());
