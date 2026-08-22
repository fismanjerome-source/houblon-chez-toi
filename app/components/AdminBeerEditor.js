'use client';
import { useState } from 'react';

export default function AdminBeerEditor({ beers }) {
  const [rows, setRows] = useState(
    beers.map((b) => ({
      id: b.id,
      name: b.name,
      price33: b.price33.toFixed(2),
      price75: b.price75.toFixed(2),
      deposit33: (b.depositCents33 / 100).toFixed(2),
      deposit75: (b.depositCents75 / 100).toFixed(2),
      active: b.active,
    }))
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
    const res = await fetch('/api/admin/beers', {
      method: 'PATCH',
      body: JSON.stringify({
        beers: rows.map((r) => ({
          id: r.id,
          price33: parseFloat(r.price33 || '0'),
          price75: parseFloat(r.price75 || '0'),
          depositCents33: Math.round(parseFloat(r.deposit33 || '0') * 100),
          depositCents75: Math.round(parseFloat(r.deposit75 || '0') * 100),
          active: r.active,
        })),
      }),
    });
    setSaving(false);
    setStatus(res.ok ? 'Enregistré.' : "Erreur lors de l'enregistrement.");
  }

  return (
    <form onSubmit={handleSave} style={{ border: '2px solid var(--line)', borderRadius: 2, padding: 20, background: 'var(--surface)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--pine)' }}>Bières ({rows.length})</h3>
      <p style={{ fontSize: 13, color: 'var(--copper)', marginTop: -8, marginBottom: 16 }}>
        Une bière n'apparaît sur le site que si elle est cochée « Visible » avec un prix supérieur à 0.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--line)' }}>
              <th style={{ padding: '6px 8px' }}>Bière</th>
              <th style={{ padding: '6px 8px' }}>Prix 33cl (€)</th>
              <th style={{ padding: '6px 8px' }}>Prix 75cl (€)</th>
              <th style={{ padding: '6px 8px' }}>Consigne 33cl (€)</th>
              <th style={{ padding: '6px 8px' }}>Consigne 75cl (€)</th>
              <th style={{ padding: '6px 8px' }}>Visible</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: '2px solid var(--line)' }}>
                <td style={{ padding: '6px 8px' }}>{r.name}</td>
                <td style={{ padding: '6px 8px' }}>
                  <input type="number" min="0" step="0.01" value={r.price33} onChange={(e) => updateRow(r.id, 'price33', e.target.value)} style={{ width: 80 }} />
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <input type="number" min="0" step="0.01" value={r.price75} onChange={(e) => updateRow(r.id, 'price75', e.target.value)} style={{ width: 80 }} />
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <input type="number" min="0" step="0.01" value={r.deposit33} onChange={(e) => updateRow(r.id, 'deposit33', e.target.value)} style={{ width: 80 }} />
                </td>
                <td style={{ padding: '6px 8px' }}>
                  <input type="number" min="0" step="0.01" value={r.deposit75} onChange={(e) => updateRow(r.id, 'deposit75', e.target.value)} style={{ width: 80 }} />
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                  <input type="checkbox" checked={r.active} onChange={(e) => updateRow(r.id, 'active', e.target.checked)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {status && <p style={{ fontSize: 13, color: 'var(--pine)', marginTop: 12 }}>{status}</p>}
      <button type="submit" className="btn" disabled={saving} style={{ marginTop: 12 }}>{saving ? 'Enregistrement…' : 'Enregistrer les bières'}</button>
    </form>
  );
}
