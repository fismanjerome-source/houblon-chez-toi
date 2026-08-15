'use client';
import { useState } from 'react';

let tempId = 0;

export default function AdminPricingTiers({ tiers }) {
  const [rows, setRows] = useState(tiers.map((t) => ({ key: t.id, minQuantity: t.minQuantity, discountPercent: t.discountPercent })));
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  function updateRow(key, field, value) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: `new-${tempId++}`, minQuantity: '', discountPercent: '' }]);
  }

  function removeRow(key) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    const res = await fetch('/api/admin/pricing-tiers', {
      method: 'PATCH',
      body: JSON.stringify({ tiers: rows.map((r) => ({ minQuantity: r.minQuantity, discountPercent: r.discountPercent })) }),
    });
    setSaving(false);
    setStatus(res.ok ? 'Enregistré.' : (await res.json().catch(() => ({}))).error || "Erreur lors de l'enregistrement.");
  }

  return (
    <form onSubmit={handleSave} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 20, background: 'var(--surface)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--pine)' }}>Prix dégressifs (comptes PRO)</h3>
      <p style={{ fontSize: 13, color: 'var(--copper)', marginTop: -8, marginBottom: 16 }}>
        Remise appliquée au sous-total (hors consignes) selon le nombre total de bouteilles commandées. Seul le palier le plus élevé atteint s'applique.
      </p>
      {rows.map((r) => (
        <div key={r.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 10, flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>À partir de (bouteilles)</label>
            <input type="number" min="1" value={r.minQuantity} onChange={(e) => updateRow(r.key, 'minQuantity', e.target.value)} style={{ width: 100 }} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Remise (%)</label>
            <input type="number" min="0" max="100" step="0.5" value={r.discountPercent} onChange={(e) => updateRow(r.key, 'discountPercent', e.target.value)} style={{ width: 90 }} />
          </div>
          <button type="button" onClick={() => removeRow(r.key)} style={{ background: 'transparent', border: 'none', color: 'var(--copper)', cursor: 'pointer', fontSize: 13 }}>Supprimer</button>
        </div>
      ))}
      <button type="button" onClick={addRow} style={{ background: 'transparent', border: '1px dashed var(--line)', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--pine)', marginBottom: 16 }}>
        + Ajouter un palier
      </button>
      {status && <p style={{ fontSize: 13, color: 'var(--pine)' }}>{status}</p>}
      <div>
        <button type="submit" className="btn" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer les paliers'}</button>
      </div>
    </form>
  );
}
