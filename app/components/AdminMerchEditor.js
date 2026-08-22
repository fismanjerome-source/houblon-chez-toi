'use client';
import { useState } from 'react';

export default function AdminMerchEditor({ products }) {
  const [rows, setRows] = useState(
    products.map((p) => ({ id: p.id, name: p.name, priceEuros: (p.priceCents / 100).toFixed(2), active: p.active }))
  );
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    const res = await fetch('/api/admin/merch', {
      method: 'PATCH',
      body: JSON.stringify({
        products: rows.map((r) => ({ id: r.id, name: r.name, priceCents: Math.round(parseFloat(r.priceEuros || '0') * 100), active: r.active })),
      }),
    });
    setSaving(false);
    setStatus(res.ok ? 'Enregistré.' : "Erreur lors de l'enregistrement.");
  }

  return (
    <form onSubmit={handleSave} style={{ border: '2px solid var(--line)', borderRadius: 2, padding: 20, background: 'var(--surface)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--pine)' }}>Boutique</h3>
      {rows.map((r) => (
        <div key={r.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 12, flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label>Nom</label>
            <input value={r.name} onChange={(e) => updateRow(r.id, 'name', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Prix (€)</label>
            <input type="number" min="0" step="0.01" value={r.priceEuros} onChange={(e) => updateRow(r.id, 'priceEuros', e.target.value)} style={{ width: 100 }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5 }}>
            <input type="checkbox" checked={r.active} onChange={(e) => updateRow(r.id, 'active', e.target.checked)} />
            Visible
          </label>
        </div>
      ))}
      {status && <p style={{ fontSize: 13, color: 'var(--pine)' }}>{status}</p>}
      <button type="submit" className="btn" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer la boutique'}</button>
    </form>
  );
}
