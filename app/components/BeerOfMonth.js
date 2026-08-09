export default function BeerOfMonth({ beer }) {
  if (!beer) return null;

  return (
    <section
      className="wrap"
      style={{ padding: '36px 0' }}
    >
      <div style={{ background: 'var(--pine)', color: 'var(--paper)', borderRadius: 6, padding: '32px 28px', display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexShrink: 0, margin: '0 auto' }}>
          {beer.bottleImageUrl && (
            <img src={beer.bottleImageUrl} alt={`Bouteille ${beer.name}`} style={{ width: 80, height: 220, objectFit: 'contain' }} />
          )}
          {beer.glassImageUrl && (
            <img src={beer.glassImageUrl} alt={`Verre ${beer.name}`} style={{ width: 70, height: 150, objectFit: 'contain' }} />
          )}
        </div>
        <div style={{ flex: '1 1 280px', minWidth: 240 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.08em', color: 'var(--amber)', marginBottom: 8 }}>
            BIÈRE DU MOIS
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, margin: '0 0 6px' }}>{beer.name}</h2>
          {beer.abv > 0 && (
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, opacity: 0.75, marginBottom: 14 }}>{beer.abv}% vol.</div>
          )}
          {beer.shortHistory && (
            <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.92, marginBottom: 18, maxWidth: 520 }}>{beer.shortHistory}</p>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={`#beer-${beer.id}`} className="btn" style={{ background: 'var(--amber)', borderColor: 'var(--amber)', color: 'var(--pine)' }}>
              Commander
            </a>
            {beer.learnMoreUrl && (
              <a
                href={beer.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'rgba(243,236,216,0.5)' }}
              >
                En savoir plus →
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
