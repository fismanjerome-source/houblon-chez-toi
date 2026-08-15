'use client';
import { useState } from 'react';

export default function AdminPromoCodeCreator() {
  const [form, setForm] = useState({
    code: '', kind: 'PROMO', discountType: 'FIXED', discountValue: '', maxUses: '', expiresAt: '', restrictToEmail: '',
  });
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    const res = await fetch('/api/admin/promo-codes', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setStatus(data.error || "Erreur lors de la création.");
      return;
    }
    setStatus('Code créé.');
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 20, background: 'var(--surface)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--pine)' }}>Créer un code</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Code</label>
          <input value={form.code} onChange={(e) => update('code', e.target.value)} placeholder="BIENVENUE10" style={{ width: 140, textTransform: 'uppercase' }} required />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Type</label>
          <select value={form.kind} onChange={(e) => update('kind', e.target.value)} style={{ width: 170 }}>
            <option value="PROMO">Code promo</option>
            <option value="PARTNER_REFERRAL">Code parrainage partenaire</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Remise</label>
          <select value={form.discountType} onChange={(e) => update('discountType', e.target.value)} style={{ width: 100 }}>
            <option value="FIXED">€ fixe</option>
            <option value="PERCENT">%</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Valeur</label>
          <input type="number" min="0" step="0.01" value={form.discountValue} onChange={(e) => update('discountValue', e.target.value)} style={{ width: 90 }} required />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Usages max</label>
          <input type="number" min="1" value={form.maxUses} onChange={(e) => update('maxUses', e.target.value)} placeholder="illimité" style={{ width: 100 }} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Expire le</label>
          <input type="date" value={form.expiresAt} onChange={(e) => update('expiresAt', e.target.value)} style={{ width: 150 }} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Réservé à (email)</label>
          <input type="email" value={form.restrictToEmail} onChange={(e) => update('restrictToEmail', e.target.value)} placeholder="facultatif" style={{ width: 200 }} />
        </div>
      </div>
      {status && <p style={{ fontSize: 13, color: 'var(--pine)', marginTop: 12 }}>{status}</p>}
      <button type="submit" className="btn" disabled={saving} style={{ marginTop: 12 }}>{saving ? 'Création…' : 'Créer le code'}</button>
    </form>
  );
}
