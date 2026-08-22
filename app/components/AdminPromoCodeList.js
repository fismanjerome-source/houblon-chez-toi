'use client';
import { useState } from 'react';

const KIND_LABELS = { PROMO: 'Code promo', PARTNER_REFERRAL: 'Parrainage partenaire' };

function formatDiscount(code) {
  return code.discountType === 'PERCENT' ? `${code.discountValue}%` : `${(code.discountValue / 100).toFixed(2)} €`;
}

export default function AdminPromoCodeList({ codes: initialCodes }) {
  const [codes, setCodes] = useState(initialCodes);

  async function toggleActive(id, active) {
    setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
    await fetch(`/api/admin/promo-codes/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) });
  }

  async function remove(id) {
    setCodes((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/admin/promo-codes/${id}`, { method: 'DELETE' });
  }

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 20, background: 'var(--surface)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--pine)' }}>Codes existants ({codes.length})</h3>
      {codes.length === 0 && <p style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.55)' }}>Aucun code créé pour le moment.</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th style={{ padding: '6px 8px' }}>Code</th>
              <th style={{ padding: '6px 8px' }}>Type</th>
              <th style={{ padding: '6px 8px' }}>Remise</th>
              <th style={{ padding: '6px 8px' }}>Usages</th>
              <th style={{ padding: '6px 8px' }}>Expire</th>
              <th style={{ padding: '6px 8px' }}>Actif</th>
              <th style={{ padding: '6px 8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                <td style={{ padding: '6px 8px', fontFamily: 'Public Sans, sans-serif' }}>{c.code}{c.restrictToEmail ? ` (${c.restrictToEmail})` : ''}</td>
                <td style={{ padding: '6px 8px' }}>{KIND_LABELS[c.kind] || c.kind}</td>
                <td style={{ padding: '6px 8px' }}>{formatDiscount(c)}</td>
                <td style={{ padding: '6px 8px' }}>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                <td style={{ padding: '6px 8px' }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : '—'}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                  <input type="checkbox" checked={c.active} onChange={(e) => toggleActive(c.id, e.target.checked)} />
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <button type="button" onClick={() => remove(c.id)} style={{ background: 'none', border: 'none', color: 'var(--copper)', cursor: 'pointer', fontSize: 12 }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
