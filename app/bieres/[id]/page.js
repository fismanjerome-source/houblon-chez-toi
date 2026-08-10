const { prisma } = require('../../../lib/db');
import FlagIcon from '../../components/FlagIcon';
const { BEER_COLORS } = require('../../components/beerColors');

async function getBeer(id) {
  return prisma.beer.findUnique({
    where: { id },
    include: { glasses: { orderBy: { volumeCl: 'asc' } } },
  });
}

export async function generateMetadata({ params }) {
  const beer = await getBeer(params.id);
  return { title: beer ? `${beer.name} — Houblon chez toi` : 'Bière introuvable — Houblon chez toi' };
}

export default async function BeerPage({ params }) {
  const beer = await getBeer(params.id);

  if (!beer) {
    return (
      <main className="wrap" style={{ padding: '48px 0' }}>
        <h1 style={{ color: 'var(--pine)' }}>Bière introuvable</h1>
        <a href="/#catalogue" className="btn" style={{ marginTop: 16, display: 'inline-block' }}>Retour au catalogue</a>
      </main>
    );
  }

  const color = BEER_COLORS[beer.name] || 'var(--line)';
  const glasses = beer.glasses || [];
  const glassImage = (glasses.find((g) => g.imageUrl) || {}).imageUrl;

  return (
    <main className="wrap" style={{ padding: '40px 0 60px', maxWidth: 800 }}>
      <a href="/#catalogue" style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--copper)', textDecoration: 'none' }}>
        ← Retour au catalogue
      </a>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 20, marginBottom: 32 }}>
        {(beer.bottleImageUrl || glassImage) && (
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexShrink: 0, margin: '0 auto', width: 215 }}>
            <div style={{ width: 110, height: 310, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {beer.bottleImageUrl && (
                <img src={beer.bottleImageUrl} alt={`Bouteille ${beer.name}`} style={{ maxWidth: 110, maxHeight: 310, objectFit: 'contain' }} />
              )}
            </div>
            <div style={{ width: 95, height: 310, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {glassImage && (
                <img src={glassImage} alt={`Verre ${beer.name}`} style={{ maxWidth: 95, maxHeight: 240, objectFit: 'contain' }} />
              )}
            </div>
          </div>
        )}

        <div style={{ flex: '1 1 320px', minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 32, color: 'var(--pine)', margin: 0 }}>{beer.name}</h1>
            <FlagIcon country={beer.country} size={22} />
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12.5, color: 'rgba(15,23,18,0.55)', marginBottom: 4 }}>
            {beer.brewery} — {beer.origin}
          </div>
          {beer.abv > 0 && (
            <div style={{ display: 'inline-block', background: color, color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 12, padding: '3px 10px', borderRadius: 12, marginTop: 8 }}>
              {beer.abv}% vol.
            </div>
          )}

          <p style={{ fontSize: 15, color: 'rgba(15,23,18,0.8)', lineHeight: 1.65, marginTop: 18 }}>{beer.description}</p>

          {beer.tastingNote && (
            <p style={{ fontSize: 14, color: 'var(--copper)', fontStyle: 'italic', marginTop: 8 }}>
              « {beer.tastingNote} » — notre avis
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
            <a href={`/#beer-${beer.id}`} className="btn">Commander cette bière</a>
            {beer.learnMoreUrl && (
              <a href={beer.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'transparent', color: 'var(--pine)' }}>
                Site de la brasserie →
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        <TastingCard label="Robe" icon="👁️" text={beer.appearance} />
        <TastingCard label="Nez" icon="👃" text={beer.aroma} />
        <TastingCard label="Bouche" icon="👅" text={beer.taste} />
        <TastingCard label="Température de service" icon="🌡️" text={beer.servingTemp} />
        <TastingCard label="Accords mets-bière" icon="🍽️" text={beer.foodPairing} />
      </div>

      {beer.brewHistory && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, color: 'var(--pine)', marginBottom: 8 }}>Histoire</h2>
          <p style={{ fontSize: 14, color: 'rgba(15,23,18,0.78)', lineHeight: 1.7 }}>{beer.brewHistory}</p>
        </div>
      )}

      {glasses.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, color: 'var(--pine)', marginBottom: 12 }}>Verre{glasses.length > 1 ? 's' : ''} proposé{glasses.length > 1 ? 's' : ''}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {glasses.map((g) => (
              <div key={g.id} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '10px 14px', fontSize: 13.5 }}>
                {g.name} — <span style={{ fontFamily: 'Space Mono, monospace' }}>{g.volumeCl}cl · {g.price.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function TastingCard({ label, icon, text }) {
  if (!text) return null;
  return (
    <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line)', borderRadius: 6, padding: 16 }}>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, textTransform: 'uppercase', color: 'var(--copper)', marginBottom: 6 }}>
        {icon} {label}
      </div>
      <p style={{ fontSize: 13.5, color: 'rgba(15,23,18,0.8)', lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  );
}
