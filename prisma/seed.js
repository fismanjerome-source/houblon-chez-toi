const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  await prisma.beer.createMany({
    data: [
      {
        name: 'Queue de Charrue',
        brewery: 'Brasserie du Nord',
        origin: 'Steenwerck, Nord',
        country: 'FR',
        abv: 6.0,
        price33: 2.6,
        price75: 5.6,
        glassName: 'Calice à pied Queue de Charrue',
        glassPrice: 4.9,
        description: "Ambrée fermière du Nord, brassée près de la frontière belge.",
      },
      {
        name: 'Anosteke',
        brewery: 'Brasserie du Pays Flamand',
        origin: 'Merville, Nord',
        country: 'FR',
        abv: 8.0,
        price33: 2.8,
        price75: 6.0,
        glassName: 'Verre ballon sculpté Anosteke',
        glassPrice: 6.5,
        description: 'Blonde du Nord aux notes fleuries et fruitées.',
      },
      {
        name: 'Paix Dieu',
        brewery: 'Brasserie du Bocq',
        origin: 'Abbaye de Bonlieu, Belgique',
        country: 'BE',
        abv: 10.0,
        price33: 3.2,
        price75: 6.8,
        glassName: 'Verre demi-lune Paix Dieu',
        glassPrice: 5.5,
        description: "Triple d'abbaye ronde et épicée.",
      },
      {
        name: 'Chouffe',
        brewery: "Brasserie d'Achouffe",
        origin: 'Achouffe, Belgique',
        country: 'BE',
        abv: 8.0,
        price33: 3.0,
        price75: 6.4,
        glassName: 'Verre ballon Chouffe',
        glassPrice: 7.2,
        description: 'Blonde emblématique des Ardennes belges.',
      },
    ],
  });

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
