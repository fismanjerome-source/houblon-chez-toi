const TXT = {
  fr: { label: 'COFFRET DÉCOUVERTE', beersSuffix: (n) => `${n} bières sélectionnées, une de chacune.`, quantity: 'Quantité' },
  nl: { label: 'ONTDEKKINGSPAKKET', beersSuffix: (n) => `${n} geselecteerde bieren, telkens één stuk.`, quantity: 'Aantal' },
};

export default function BasketCard({ basket, quantity, onChange, locale = 'fr' }) {
  const t = TXT[locale] || TXT.fr;
  const description = locale === 'nl' && basket.descriptionNl ? basket.descriptionNl : basket.description;
  return (
    <div style={{ background: 'var(--pine)', color: 'var(--paper)', borderRadius: 8, padding: 24, display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, width: 180, flexShrink: 0 }}>
        {basket.beers.slice(0, 15).map((b) => (
          <div key={b.id} style={{ background: 'color-mix(in srgb, var(--paper) 12%, transparent)', borderRadius: 4, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {b.bottleImageUrl && <img src={b.bottleImageUrl} alt={b.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
          </div>
        ))}
      </div>
      <div style={{ flex: '1 1 260px' }}>
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.08em', color: 'var(--amber)', marginBottom: 6 }}>
          {t.label}
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, margin: '0 0 8px' }}>{basket.name}</h2>
        {description && <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.92, marginBottom: 12 }}>{description}</p>}
        <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 16 }}>{t.beersSuffix(basket.beers.length)}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 18 }}>{(basket.priceCents / 100).toFixed(2)} €</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Space Mono, monospace', fontSize: 12 }}>
            {t.quantity}
            <input
              type="number" min={0} max={9}
              value={quantity === 0 ? '' : quantity}
              placeholder="0"
              onChange={(e) => onChange(e.target.value === '' ? '0' : e.target.value)}
              onFocus={(e) => e.target.select()}
              style={{ width: 55, padding: 6, border: '1px solid color-mix(in srgb, var(--paper) 40%, transparent)', borderRadius: 3, background: 'transparent', color: 'var(--paper)' }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
