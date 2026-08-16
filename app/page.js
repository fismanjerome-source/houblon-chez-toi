const { prisma } = require('../lib/db');
const { getUpcomingSlots } = require('../lib/slots');
import OrderForm from './OrderForm';

export const dynamic = 'force-dynamic';
import BeerOfMonth from './components/BeerOfMonth';
import HeroGlass from './components/HeroGlass';
import DirectContact from './components/DirectContact';
import BeerMap from './components/BeerMap';
import DeliveryZoneMap from './components/DeliveryZoneMap';
import OurValues from './components/OurValues';
import ReviewsTeaser from './components/ReviewsTeaser';
import ScrollReveal from './components/ScrollReveal';
const { getLocale } = require('../lib/i18n');
const { TOWN_NAMES } = require('../lib/towns');

const SITE_URL = process.env.SITE_URL || 'https://houblon-chez-toi-kohl.vercel.app';

const TXT = {
  fr: {
    tagline: 'Bières artisanales françaises et belges, livrées à domicile dans le secteur de Bondues.',
    mapTitle: "D'où viennent nos bières ?",
    mapIntro: '🏠 Tout part de Bondues — nos brasseries sont toutes à moins de 2h de route, pour des bières vraiment locales. Cliquez sur un drapeau pour découvrir la bière et sa fiche.',
    zoneTitle: 'Notre zone de livraison',
    zoneIntro: "🏠 On livre à vélo/voiture depuis Bondues, dans le périmètre entouré en couleur ci-dessous.",
    frBeers: 'Bières françaises',
    beBeers: 'Bières belges',
  },
  nl: {
    tagline: 'Ambachtelijke Franse en Belgische bieren, thuisbezorgd in de regio Bondues.',
    mapTitle: 'Waar komen onze bieren vandaan?',
    mapIntro: '🏠 Alles vertrekt vanuit Bondues — onze brouwerijen liggen allemaal op minder dan 2 uur rijden, voor echt lokale bieren. Klik op een vlag om het bier en zijn fiche te ontdekken.',
    zoneTitle: 'Ons leveringsgebied',
    zoneIntro: '🏠 We leveren vanuit Bondues, binnen de gekleurde omtrek hieronder.',
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LiquorStore',
    name: 'Houblon chez toi',
    image: `${SITE_URL}/og-image.png`,
    url: SITE_URL,
    telephone: '+33608129145',
    email: 'contact@houbloncheztoi.fr',
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '984 Avenue du Général de Gaulle',
      addressLocality: 'Bondues',
      postalCode: '59910',
      addressCountry: 'FR',
    },
    areaServed: TOWN_NAMES.map((name) => ({ '@type': 'City', name })),
    ...(allReviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewsAverage.toFixed(1),
        reviewCount: allReviews.length,
      },
    }),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap" style={{ padding: '40px 0 8px' }}>
        <h1 style={{ fontSize: 40, color: 'var(--pine)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          Houblon chez toi
          <HeroGlass size={44} />
        </h1>
        <p style={{ maxWidth: 480, color: 'rgba(var(--ink-rgb),0.7)' }}>
          {t.tagline}
        </p>
      </div>

      <ScrollReveal><OurValues locale={locale} /></ScrollReveal>

      <ScrollReveal><BeerOfMonth beer={beerOfMonth} locale={locale} /></ScrollReveal>

      <ScrollReveal><DirectContact locale={locale} /></ScrollReveal>

      <ScrollReveal><ReviewsTeaser reviews={featuredReviews} average={reviewsAverage} locale={locale} /></ScrollReveal>

      <ScrollReveal as="section" style={{ padding: '8px 0 40px' }}>
        <div className="wrap">
          <h2 style={{ color: 'var(--pine)', marginBottom: 6 }}>{t.mapTitle}</h2>
          <p style={{ fontSize: 13.5, color: 'rgba(var(--ink-rgb),0.6)', marginBottom: 16 }}>
            {t.mapIntro}
          </p>
          <BeerMap beers={beers} />
        </div>
      </ScrollReveal>

      <ScrollReveal as="section" style={{ padding: '8px 0 40px' }}>
        <div className="wrap">
          <h2 style={{ color: 'var(--pine)', marginBottom: 6 }}>{t.zoneTitle}</h2>
          <p style={{ fontSize: 13.5, color: 'rgba(var(--ink-rgb),0.6)', marginBottom: 16 }}>
            {t.zoneIntro}
          </p>
          <DeliveryZoneMap />
        </div>
      </ScrollReveal>

      <section id="catalogue" className="wrap" style={{ paddingBottom: 60, scrollMarginTop: 90 }}>
        <OrderForm groups={groups} slots={slots} basket={basket} merchProducts={merchProducts} pricingTiers={pricingTiers} locale={locale} />
      </section>
    </main>
  );
}
