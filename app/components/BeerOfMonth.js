const TXT = {
  fr: { label: 'BIÈRE DU MOIS', order: 'Commander', learnMore: 'En savoir plus →' },
  nl: { label: 'BIER VAN DE MAAND', order: 'Bestellen', learnMore: 'Meer weten →' },
};

export default function BeerOfMonth({ beer, locale = 'fr' }) {
  if (!beer) return null;
  const t = TXT[locale] || TXT.fr;
  const glassImage = ((beer.glasses || []).find((g) => g.imageUrl) || {}).imageUrl;
  const shortHistory = locale === 'nl' && beer.shortHistoryNl ? beer.shortHistoryNl : beer.shortHistory;

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
          {glassImage && (
            <img src={glassImage} alt={`Verre ${beer.name}`} style={{ width: 70, height: 150, objectFit: 'contain' }} />
          )}
        </div>
        <div style={{ flex: '1 1 280px', minWidth: 240 }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.08em', color: 'var(--amber)', marginBottom: 8 }}>
            {t.label}
          </div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, margin: '0 0 6px' }}>{beer.name}</h2>
          {beer.abv > 0 && (
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, opacity: 0.75, marginBottom: 14 }}>{beer.abv}% vol.</div>
          )}
          {shortHistory && (
            <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.92, marginBottom: 18, maxWidth: 520 }}>{shortHistory}</p>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={`#beer-${beer.id}`} className="btn" style={{ background: 'var(--amber)', borderColor: 'var(--amber)', color: 'var(--pine-fixed)' }}>
              {t.order}
            </a>
            {beer.learnMoreUrl && (
              <a
                href={beer.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ background: 'transparent', color: 'var(--paper)', borderColor: 'color-mix(in srgb, var(--paper) 50%, transparent)' }}
              >
                {t.learnMore}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
