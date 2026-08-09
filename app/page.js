const { prisma } = require('../lib/db');
const { getUpcomingSlots } = require('../lib/slots');
import OrderForm from './OrderForm';

async function getBeers() {
  return prisma.beer.findMany({ where: { active: true }, orderBy: { country: 'asc' } });
}

export default async function HomePage() {
  const beers = await getBeers();
  const groups = [
    { title: 'Bières françaises', beers: beers.filter((b) => b.country === 'FR') },
    { title: 'Bières belges', beers: beers.filter((b) => b.country === 'BE') },
  ];
  const slots = getUpcomingSlots();

  return (
    <main>
      <header className="wrap" style={{ padding: '48px 0' }}>
        <h1 style={{ fontSize: 40, color: 'var(--pine)' }}>Houblon chez toi</h1>
        <p style={{ maxWidth: 480, color: 'rgba(15,23,18,0.7)' }}>
          Bières artisanales françaises et belges, livrées à domicile dans le secteur de Bondues.
        </p>
        <a href="/compte" className="btn" style={{ marginTop: 16, display: 'inline-block' }}>Mon compte</a>
      </header>

      <section className="wrap" style={{ paddingBottom: 60 }}>
        <OrderForm groups={groups} slots={slots} />
      </section>
    </main>
  );
}
