const { prisma } = require('../lib/db');
const { getUpcomingSlots } = require('../lib/slots');
import OrderForm from './OrderForm';
import BeerOfMonth from './components/BeerOfMonth';
import HeroGlass from './components/HeroGlass';

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
      <div className="wrap" style={{ padding: '40px 0 8px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 320px' }}>
          <h1 style={{ fontSize: 40, color: 'var(--pine)' }}>Houblon chez toi</h1>
          <p style={{ maxWidth: 480, color: 'rgba(15,23,18,0.7)' }}>
            Bières artisanales françaises et belges, livrées à domicile dans le secteur de Bondues.
          </p>
        </div>
        <HeroGlass />
      </div>

      <BeerOfMonth beer={beerOfMonth} />

      <section className="wrap" style={{ paddingBottom: 60 }}>
        <OrderForm groups={groups} slots={slots} />
      </section>
    </main>
  );
}
