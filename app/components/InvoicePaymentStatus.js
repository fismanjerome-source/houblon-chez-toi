'use client';
import { useState } from 'react';

export default function InvoicePaymentStatus({ invoiceId, dueDate, paidAt }) {
  const [paid, setPaid] = useState(!!paidAt);
  const [saving, setSaving] = useState(false);

  async function togglePaid() {
    setSaving(true);
    const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
      method: 'PATCH',
      body: JSON.stringify({ paid: !paid }),
    });
    setSaving(false);
    if (res.ok) setPaid((v) => !v);
  }

  if (paid) {
    return <span style={{ fontSize: 11.5, color: 'var(--pine)', fontFamily: 'Space Mono, monospace' }}>✓ Payée</span>;
  }

  const overdue = dueDate && new Date(dueDate) < new Date();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11.5, fontFamily: 'Space Mono, monospace', color: overdue ? '#A32D2D' : 'var(--copper)' }}>
        {dueDate ? `${overdue ? 'En retard — échéance' : 'À régler avant le'} ${new Date(dueDate).toLocaleDateString('fr-FR')}` : 'Impayée'}
      </span>
      <button
        type="button"
        onClick={togglePaid}
        disabled={saving}
        style={{ fontSize: 11, padding: '3px 8px', border: '1px solid var(--pine)', borderRadius: 3, background: 'transparent', color: 'var(--pine)', cursor: 'pointer' }}
      >
        {saving ? '…' : 'Marquer payée'}
      </button>
    </div>
  );
}
