const { prisma } = require('../../lib/db');
import Stars from '../components/ReviewStars';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Avis clients — Houblon chez toi' };

export default async function AvisPage() {
  const reviews = await prisma.review.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } });
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>Avis clients</h1>

      {reviews.length > 0 ? (
        <p style={{ color: 'rgba(var(--ink-rgb),0.75)', fontSize: 15, marginBottom: 28 }}>
          <Stars rating={Math.round(average)} /> {average.toFixed(1)} / 5 sur {reviews.length} avis
        </p>
      ) : (
        <p style={{ color: 'rgba(var(--ink-rgb),0.65)' }}>Pas encore d'avis publiés — les premiers arrivent bientôt !</p>
      )}

      {reviews.map((r) => (
        <div key={r.id} style={{ border: '2px solid var(--line)', borderRadius: 2, padding: 16, marginBottom: 12, background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
            <strong style={{ color: 'var(--pine)', fontSize: 14.5 }}>{r.customerName}</strong>
            <Stars rating={r.rating} />
          </div>
          {r.comment && <p style={{ margin: 0, fontSize: 14, color: 'rgba(var(--ink-rgb),0.8)', lineHeight: 1.6 }}>{r.comment}</p>}
        </div>
      ))}
    </main>
  );
}
