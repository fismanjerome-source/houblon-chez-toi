'use client';
import { useState } from 'react';

export default function AdminProAccounts({ users }) {
  const [rows, setRows] = useState(users.map((u) => ({ id: u.id, proApproved: u.proApproved })));
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  function toggle(id) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, proApproved: !r.proApproved } : r)));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setStatus('');
    const res = await fetch('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ users: rows }) });
    setSaving(false);
    setStatus(res.ok ? 'Enregistré.' : "Erreur lors de l'enregistrement.");
  }

  return (
    <form onSubmit={handleSave} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 20, background: 'var(--surface)', marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, color: 'var(--pine)' }}>Comptes clients</h3>
      <p style={{ fontSize: 13, color: 'var(--copper)', marginTop: -8, marginBottom: 16 }}>
        Un compte coché « PRO » peut régler par facture à 30 jours et bénéficie des prix dégressifs.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
              <th style={{ padding: '6px 8px' }}>Client</th>
              <th style={{ padding: '6px 8px' }}>Email</th>
              <th style={{ padding: '6px 8px' }}>Type déclaré</th>
              <th style={{ padding: '6px 8px' }}>Compte PRO</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const row = rows.find((r) => r.id === u.id);
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '6px 8px' }}>{u.name}</td>
                  <td style={{ padding: '6px 8px' }}>{u.email}</td>
                  <td style={{ padding: '6px 8px' }}>{u.accountType}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <input type="checkbox" checked={row.proApproved} onChange={() => toggle(u.id)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <p style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.55)' }}>Aucun compte client pour le moment.</p>}
      {status && <p style={{ fontSize: 13, color: 'var(--pine)', marginTop: 12 }}>{status}</p>}
      <button type="submit" className="btn" disabled={saving} style={{ marginTop: 12 }}>{saving ? 'Enregistrement…' : 'Enregistrer les comptes'}</button>
    </form>
  );
}
