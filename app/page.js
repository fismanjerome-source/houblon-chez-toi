const { prisma } = require('../lib/db');
const { getUpcomingSlots } = require('../lib/slots');
import OrderForm from './OrderForm';
import BeerOfMonth from './components/BeerOfMonth';
import HeroGlass from './components/HeroGlass';
import DirectContact from './components/DirectContact';
import BeerMap from './components/BeerMap';

async function getBeers() {
  return prisma.beer.findMany({ where: { active: true }, orderBy: { country: 'asc' } });
}

export default async function HomePage() {
  const beers = await getBeers();
  const beerOfMonth = beers.find((b) => b.isBeerOfMonth);
  const groups = [
    { title: 'Bières françaises', beers: beers.filter((b) => b.country === 'FR') },
    { title: 'Bières belges', beers: beers.filter((b) => b.country === 'BE') },
  ];
  const slots = getUpcomingSlots();

  return (
    <main>
      <div className="wrap" style={{ padding: '40px 0 8px' }}>
        <h1 style={{ fontSize: 40, color: 'var(--pine)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          Houblon chez toi
          <HeroGlass size={44} />
        </h1>
        <p style={{ maxWidth: 480, color: 'rgba(15,23,18,0.7)' }}>
          Bières artisanales françaises et belges, livrées à domicile dans le secteur de Bondues.
        </p>
      </div>

      <BeerOfMonth beer={beerOfMonth} />

      <DirectContact />

      <section className="wrap" style={{ padding: '8px 0 40px' }}>
        <h2 style={{ color: 'var(--pine)', marginBottom: 6 }}>D'où viennent nos bières ?</h2>
        <p style={{ fontSize: 13.5, color: 'rgba(15,23,18,0.6)', marginBottom: 16 }}>
          Cliquez sur un point pour découvrir la bière et sa fiche.
        </p>
        <BeerMap beers={beers} />
      </section>

      <section id="catalogue" className="wrap" style={{ paddingBottom: 60, scrollMarginTop: 90 }}>
        <OrderForm groups={groups} slots={slots} />
      </section>
    </main>
  );
}
