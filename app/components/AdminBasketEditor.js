'use client';
import { useState } from 'react';

export default function AdminBasketEditor({ basket, allBeers }) {
  const [selectedIds, setSelectedIds] = useState(new Set((basket?.beers || []).map((b) => b.id)));
  const [priceEuros, setPriceEuros] = useState(basket ? (basket.priceCents / 100).toFixed(2) : '0.00');
  const [active, setActive] = useState(basket?.active || false);
  const [description, setDescription] = useState(basket?.description || '');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleBeer(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    const res = await fetch('/api/admin/basket', {
      method: 'PATCH',
      body: JSON.stringify({
        beerIds: [...selectedIds],
        priceCents: Math.round(parseFloat(priceEuros || '0') * 100),
        active,
        description,
      }),
    });
    setSaving(false);
    setStatus(res.ok ? 'Enregistré.' : "Erreur lors de l'enregistrement.");
  }

  return (
    <form onSubmit={handleSave} style={{ border: '2px solid var(--line)', borderRadius: 2, padding: 20, background: 'var(--surface)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--pine)' }}>Panier de la quinzaine ({selectedIds.size} bière{selectedIds.size > 1 ? 's' : ''})</h3>

      <div className="field">
        <label>Description</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 16 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Prix (€)</label>
          <input type="number" min="0" step="0.01" value={priceEuros} onChange={(e) => setPriceEuros(e.target.value)} style={{ width: 100 }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Visible sur le site
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8, marginBottom: 16 }}>
        {allBeers.map((beer) => (
          <label key={beer.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={selectedIds.has(beer.id)} onChange={() => toggleBeer(beer.id)} />
            {beer.name}
          </label>
        ))}
      </div>

      {status && <p style={{ fontSize: 13, color: 'var(--pine)' }}>{status}</p>}
      <button type="submit" className="btn" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer le panier'}</button>
    </form>
  );
}
