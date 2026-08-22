'use client';
import { useState } from 'react';

export default function AdminReviewList({ reviews: initialReviews }) {
  const [reviews, setReviews] = useState(initialReviews);

  async function togglePublished(id, published) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, published } : r)));
    await fetch(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ published }) });
  }

  return (
    <div style={{ border: '2px solid var(--line)', borderRadius: 2, padding: 20, background: 'var(--surface)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--pine)' }}>Avis clients ({reviews.length})</h3>
      <p style={{ fontSize: 13, color: 'var(--copper)', marginTop: -8, marginBottom: 16 }}>
        Décoche un avis pour le retirer de la page publique, sans le supprimer.
      </p>
      {reviews.length === 0 && <p style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.55)' }}>Aucun avis pour le moment.</p>}
      {reviews.map((r) => (
        <div key={r.id} style={{ border: '2px solid var(--line)', borderRadius: 2, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', opacity: r.published ? 1 : 0.5 }}>
          <div style={{ flex: '1 1 300px' }}>
            <strong>{r.customerName}</strong> — {'⭐'.repeat(r.rating)}
            {r.comment && <p style={{ margin: '4px 0 0', fontSize: 13.5 }}>« {r.comment} »</p>}
            <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, color: 'rgba(var(--ink-rgb),0.5)', marginTop: 4 }}>
              {new Date(r.createdAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, whiteSpace: 'nowrap' }}>
            <input type="checkbox" checked={r.published} onChange={(e) => togglePublished(r.id, e.target.checked)} />
            Publié
          </label>
        </div>
      ))}
    </div>
  );
}
