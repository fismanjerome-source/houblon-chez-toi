'use client';
import { useState } from 'react';

export default function ReviewForm({ token }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('idle'); // idle | saving | done | error
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) {
      setError('Choisissez une note de 1 à 5 étoiles.');
      return;
    }
    setStatus('saving');
    setError('');
    const res = await fetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({ token, rating, comment }),
    });
    if (res.ok) {
      setStatus('done');
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Une erreur est survenue.");
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div style={{ background: 'var(--paper-warm)', border: '2px solid var(--line)', borderRadius: 3, padding: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 16, color: 'var(--pine)', margin: 0 }}>Merci beaucoup pour votre avis !</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 3, padding: 24 }}>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, lineHeight: 1, color: n <= (hover || rating) ? 'var(--amber)' : 'rgba(var(--ink-rgb),0.2)' }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Un mot sur votre expérience (facultatif)"
        rows={4}
        style={{ width: '100%', padding: 10, border: '2px solid var(--line)', borderRadius: 2, fontFamily: 'inherit', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
      />
      {error && <p style={{ color: 'var(--copper)', fontSize: 13, marginTop: 8 }}>{error}</p>}
      <button type="submit" className="btn" disabled={status === 'saving'} style={{ marginTop: 14, width: '100%' }}>
        {status === 'saving' ? 'Envoi…' : 'Envoyer mon avis'}
      </button>
    </form>
  );
}
