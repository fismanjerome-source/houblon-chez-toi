const { prisma } = require('../lib/db');

async function getBeers() {
  return prisma.beer.findMany({ where: { active: true }, orderBy: { country: 'asc' } });
}

export default async function HomePage() {
  const beers = await getBeers();
  const french = beers.filter((b) => b.country === 'FR');
  const belgian = beers.filter((b) => b.country === 'BE');

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
        <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>Bières françaises</h2>
        <BeerList beers={french} />

        <h2 style={{ color: 'var(--pine)', margin: '40px 0 16px' }}>Bières belges</h2>
        <BeerList beers={belgian} />
      </section>
    </main>
  );
}

function BeerList({ beers }) {
  return (
    <div style={{ display: 'grid', gap: 1, background: 'var(--line)', border: '1px solid var(--line)' }}>
      {beers.map((beer) => (
        <div key={beer.id} style={{ background: 'var(--paper)', padding: 20 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: 'var(--pine)' }}>{beer.name}</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'rgba(15,23,18,0.5)', margin: '4px 0 10px' }}>
            {beer.origin} · {beer.abv}% vol.
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(15,23,18,0.7)' }}>{beer.description}</p>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, marginTop: 10 }}>
            33cl : {beer.price33.toFixed(2)} € — 75cl : {beer.price75.toFixed(2)} €
            {beer.glassName && <> — {beer.glassName} : {beer.glassPrice.toFixed(2)} €</>}
          </div>
        </div>
      ))}
    </div>
  );
}
