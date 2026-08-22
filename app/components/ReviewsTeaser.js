import Stars from './ReviewStars';

const TXT = {
  fr: { title: 'Avis clients', seeAll: 'tous les avis' },
  nl: { title: 'Klantenbeoordelingen', seeAll: 'alle beoordelingen' },
};

export default function ReviewsTeaser({ reviews, average, locale = 'fr' }) {
  if (!reviews.length) return null;
  const t = TXT[locale] || TXT.fr;

  return (
    <section className="wrap" style={{ padding: '8px 0 40px' }}>
      <h2 style={{ color: 'var(--pine)', marginBottom: 6 }}>{t.title}</h2>
      <p style={{ fontSize: 13.5, color: 'rgba(var(--ink-rgb),0.6)', marginBottom: 16 }}>
        <Stars rating={Math.round(average)} /> {average.toFixed(1)} / 5 — {locale === 'nl' ? 'bekijk' : 'voir'} <a href="/avis" style={{ color: 'var(--pine)' }}>{t.seeAll}</a>
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {reviews.map((r) => (
          <div key={r.id} style={{ flex: '1 1 220px', border: '2px solid var(--line)', borderRadius: 2, padding: 16, background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
              <strong style={{ color: 'var(--pine)', fontSize: 14 }}>{r.customerName}</strong>
              <Stars rating={r.rating} />
            </div>
            {r.comment && <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(var(--ink-rgb),0.8)', lineHeight: 1.6 }}>{r.comment}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
