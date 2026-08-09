const { prisma } = require('../../../lib/db');

async function GET() {
  const beers = await prisma.beer.findMany({
    where: { active: true },
    select: { id: true, name: true, bottleImageUrl: true, abv: true },
    orderBy: { name: 'asc' },
  });
  return new Response(JSON.stringify(beers), { status: 200 });
}

module.exports = { GET };
