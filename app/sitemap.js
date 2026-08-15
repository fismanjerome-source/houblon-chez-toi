const { prisma } = require('../lib/db');

const SITE_URL = process.env.SITE_URL || 'https://houblon-chez-toi-kohl.vercel.app';

const STATIC_PAGES = [
  { path: '/', priority: 1 },
  { path: '/faq', priority: 0.5 },
  { path: '/qui-sommes-nous', priority: 0.5 },
  { path: '/histoire', priority: 0.5 },
  { path: '/verres', priority: 0.4 },
  { path: '/avis', priority: 0.5 },
  { path: '/contact', priority: 0.5 },
  { path: '/cgu', priority: 0.2 },
  { path: '/mentions-legales', priority: 0.2 },
];

export default async function sitemap() {
  const beers = await prisma.beer.findMany({ where: { active: true }, select: { id: true } });

  const staticEntries = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(),
    priority: p.priority,
  }));

  const beerEntries = beers.map((b) => ({
    url: `${SITE_URL}/bieres/${b.id}`,
    lastModified: new Date(),
    priority: 0.7,
  }));

  return [...staticEntries, ...beerEntries];
}
