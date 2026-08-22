'use client';
import { useState } from 'react';

const STATUSES = [
  { value: 'EN_ATTENTE_PAIEMENT', label: 'En attente de paiement' },
  { value: 'EN_PREPARATION', label: 'En préparation' },
  { value: 'EN_LIVRAISON', label: 'En livraison' },
  { value: 'LIVREE', label: 'Livrée' },
  { value: 'ANNULEE', label: 'Annulée' },
];

export default function OrderStatusControl({ orderId, status }) {
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    const next = e.target.value;
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (res.ok) setCurrent(next);
  }

  return (
    <select value={current} onChange={handleChange} disabled={saving} style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 12, padding: '3px 6px', border: '2px solid var(--line)', borderRadius: 3 }}>
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}
