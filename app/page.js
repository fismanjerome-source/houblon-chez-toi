const { prisma } = require('../lib/db');
const { getUpcomingSlots } = require('../lib/slots');
import OrderForm from './OrderForm';

export const dynamic = 'force-dynamic';
import BeerOfMonth from './components/BeerOfMonth';
import HeroGlass from './components/HeroGlass';
import DirectContact from './components/DirectContact';
import BeerMap from './components/BeerMap';
import OurValues from './components/OurValues';
import ReviewsTeaser from './components/ReviewsTeaser';
const { getLocale } = require('../lib/i18n');

const TXT = {
  fr: {
    tagline: 'Bières artisanales françaises et belges, livrées à domicile dans le secteur de Bondues.',
    mapTitle: "D'où viennent nos bières ?",
    mapIntro: '🏠 Tout part de Bondues — nos brasseries sont toutes à moins de 2h de route, pour des bières vraiment locales. Cliquez sur un drapeau pour découvrir la bière et sa fiche.',
    frBeers: 'Bières françaises',
    beBeers: 'Bières belges',
  },
  nl: {
    tagline: 'Ambachtelijke Franse en Belgische bieren, thuisbezorgd in de regio Bondues.',
    mapTitle: 'Waar komen onze bieren vandaan?',
    mapIntro: '🏠 Alles vertrekt vanuit Bondues — onze brouwerijen liggen allemaal op minder dan 2 uur rijden, voor echt lokale bieren. Klik op een vlag om het bier en zijn fiche te ontdekken.',
    frBeers: 'Franse bieren',
    beBeers: 'Belgische bieren',
  },
};

async function getBeers() {
  return prisma.beer.findMany({
    where: { active: true },
    orderBy: { country: 'asc' },
    include: { glasses: { orderBy: { volumeCl: 'asc' } } },
  });
}

export default async function HomePage() {
  const locale = getLocale();
  const t = TXT[locale] || TXT.fr;
  const beers = await getBeers();
  const beerOfMonth = beers.find((b) => b.isBeerOfMonth);
  const groups = [
    { title: t.frBeers, beers: beers.filter((b) => b.country === 'FR') },
    { title: t.beBeers, beers: beers.filter((b) => b.country === 'BE') },
  ];
  const slots = getUpcomingSlots(locale);
  const basket = await prisma.basket.findFirst({ where: { active: true, priceCents: { gt: 0 } }, include: { beers: true } });
  const merchProducts = await prisma.merchProduct.findMany({ where: { active: true, priceCents: { gt: 0 } }, orderBy: { name: 'asc' } });
  const pricingTiers = await prisma.pricingTier.findMany({ orderBy: { minQuantity: 'asc' } });
  const allReviews = await prisma.review.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } });
  const reviewsAverage = allReviews.length ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length : 0;
  const featuredReviews = allReviews.slice(0, 3);

  return (
    <main>
      <div className="wrap" style={{ padding: '40px 0 8px' }}>
        <h1 style={{ fontSize: 40, color: 'var(--pine)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          Houblon chez toi
          <HeroGlass size={44} />
        </h1>
        <p style={{ maxWidth: 480, color: 'rgba(15,23,18,0.7)' }}>
          {t.tagline}
        </p>
      </div>

      <OurValues locale={locale} />

      <BeerOfMonth beer={beerOfMonth} locale={locale} />

      <DirectContact locale={locale} />

      <ReviewsTeaser reviews={featuredReviews} average={reviewsAverage} locale={locale} />

      <section className="wrap" style={{ padding: '8px 0 40px' }}>
        <h2 style={{ color: 'var(--pine)', marginBottom: 6 }}>{t.mapTitle}</h2>
        <p style={{ fontSize: 13.5, color: 'rgba(15,23,18,0.6)', marginBottom: 16 }}>
          {t.mapIntro}
        </p>
        <BeerMap beers={beers} />
      </section>

      <section id="catalogue" className="wrap" style={{ paddingBottom: 60, scrollMarginTop: 90 }}>
        <OrderForm groups={groups} slots={slots} basket={basket} merchProducts={merchProducts} pricingTiers={pricingTiers} locale={locale} />
      </section>
    </main>
  );
}
