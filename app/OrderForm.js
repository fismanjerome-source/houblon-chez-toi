'use client';
import { useState, useEffect, useMemo } from 'react';
import FlagIcon from './components/FlagIcon';
const { FREE_SHIPPING_THRESHOLD_CENTS, DELIVERY_FEE_CENTS, PICKUP_ADDRESS, computeDeliveryFeeCents } = require('../lib/delivery');
const { BEER_COLORS } = require('./components/beerColors');

const TOWNS = ['Bondues', 'Linselles', 'Mouvaux', 'Bousbecques', 'Marcq-en-Barœul', 'Wasquehal', 'Roncq', 'Comines'];
const FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD_CENTS / 100;
const DELIVERY_FEE = DELIVERY_FEE_CENTS / 100;

export default function OrderForm({ groups, slots }) {
  const beers = groups.flatMap((g) => g.beers);
  const [qty, setQty] = useState({}); // { [beerId-format]: quantity }
  const [glassChoice, setGlassChoice] = useState({}); // { [beerId]: Set<glassId> }

  function toggleGlass(beerId, glassId, checked) {
    setGlassChoice((prev) => {
      const current = new Set(prev[beerId] || []);
      if (checked) current.add(glassId);
      else current.delete(glassId);
      return { ...prev, [beerId]: current };
    });
  }
  const [town, setTown] = useState(TOWNS[0]);
  const [pickup, setPickup] = useState(false);
  const [slot, setSlot] = useState(slots[0] || '');
  const [loggedIn, setLoggedIn] = useState(null); // null = inconnu, true/false une fois vérifié
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/orders').then((res) => setLoggedIn(res.ok));
  }, []);

  function setQuantity(beerId, format, value) {
    const n = Math.max(0, Math.min(99, Number(value) || 0));
    setQty((q) => ({ ...q, [`${beerId}-${format}`]: n }));
  }

  const beerLines = useMemo(() => {
    return beers.flatMap((beer) => {
      const items = [];
      for (const format of [33, 75]) {
        const quantity = qty[`${beer.id}-${format}`] || 0;
        if (quantity > 0) {
          const unitPrice = format === 75 ? beer.price75 : beer.price33;
          items.push({ beer, format, quantity, lineTotal: unitPrice * quantity });
        }
      }
      return items;
    });
  }, [beers, qty]);

  const glassLines = useMemo(() => {
    return beers.flatMap((beer) => {
      const beerHasQty = [33, 75].some((f) => (qty[`${beer.id}-${f}`] || 0) > 0);
      if (!beerHasQty) return [];
      const selected = glassChoice[beer.id];
      if (!selected || selected.size === 0) return [];
      return (beer.glasses || [])
        .filter((g) => selected.has(g.id))
        .map((glass) => ({ beer, glass, lineTotal: glass.price }));
    });
  }, [beers, qty, glassChoice]);

  const subtotal = beerLines.reduce((sum, l) => sum + l.lineTotal, 0) + glassLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const deliveryFee = computeDeliveryFeeCents({ pickup, town, itemsTotalCents: Math.round(subtotal * 100) }) / 100;
  const total = subtotal + deliveryFee;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasItems = beerLines.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (!hasItems) {
      setStatus({ type: 'error', message: 'Ajoutez au moins une bière à votre commande.' });
      return;
    }
    setSubmitting(true);

    const items = [
      ...beerLines.map((l) => ({ beerId: l.beer.id, format: l.format, quantity: l.quantity, glassId: null })),
      ...glassLines.map((l) => ({ beerId: l.beer.id, format: 0, quantity: 1, glassId: l.glass.id })),
    ];

    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ town, pickup, slot, items }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ type: 'error', message: data.error || 'Impossible de valider la commande.' });
      return;
    }
    setQty({});
    setGlassChoice({});
    setStatus({ type: 'success', message: 'Commande envoyée ! Retrouvez-la dans "Mon compte".' });
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group.title}>
          <h2 style={{ color: 'var(--pine)', margin: '40px 0 16px' }}>{group.title}</h2>
          {group.beers.map((beer) => {
            const color = BEER_COLORS[beer.name] || 'var(--line)';
            const glasses = beer.glasses || [];
            const selectedGlassIds = glassChoice[beer.id] || new Set();
            const previewGlassImage =
              (glasses.find((g) => selectedGlassIds.has(g.id) && g.imageUrl) || {}).imageUrl ||
              (glasses.find((g) => g.imageUrl) || {}).imageUrl;
            return (
            <div
              id={`beer-${beer.id}`}
              key={beer.id}
              style={{
                background: 'var(--paper)', padding: 20, border: `3px solid ${color}`, borderRadius: 8,
                display: 'flex', gap: 20, flexWrap: 'wrap', scrollMarginTop: 90, marginBottom: 16,
              }}
            >
              {(beer.bottleImageUrl || previewGlassImage) && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0 }}>
                  {beer.bottleImageUrl && (
                    <img
                      src={beer.bottleImageUrl}
                      alt={`Bouteille ${beer.name}`}
                      style={{ width: 70, height: 200, objectFit: 'contain' }}
                    />
                  )}
                  {previewGlassImage && (
                    <img
                      src={previewGlassImage}
                      alt={`Verre ${beer.name}`}
                      style={{ width: 60, height: 170, objectFit: 'contain' }}
                    />
                  )}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <a href={`/bieres/${beer.id}`} style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: 'var(--pine)', textDecoration: 'none' }}>
                    {beer.name}
                  </a>
                  <FlagIcon country={beer.country} />
                </div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'rgba(15,23,18,0.5)', margin: '4px 0 10px' }}>
                  {beer.origin}{beer.abv > 0 && ` · ${beer.abv}% vol.`}
                </div>
                <p style={{ fontSize: 13.5, color: 'rgba(15,23,18,0.7)' }}>{beer.description}</p>
                {beer.tastingNote && (
                  <p style={{ fontSize: 13, color: 'var(--copper)', fontStyle: 'italic', marginTop: -4, marginBottom: 4 }}>
                    « {beer.tastingNote} »
                  </p>
                )}
                <a href={`/bieres/${beer.id}`} style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--pine)', textDecoration: 'underline' }}>
                  Voir la fiche complète →
                </a>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end', marginTop: 14 }}>
                  {beer.price33 > 0 && (
                    <QuantityField
                      label={`33cl — ${beer.price33.toFixed(2)} €`}
                      value={qty[`${beer.id}-33`] || 0}
                      onChange={(v) => setQuantity(beer.id, 33, v)}
                    />
                  )}
                  {beer.price75 > 0 && (
                    <QuantityField
                      label={`75cl — ${beer.price75.toFixed(2)} €`}
                      value={qty[`${beer.id}-75`] || 0}
                      onChange={(v) => setQuantity(beer.id, 75, v)}
                    />
                  )}
                </div>

                {glasses.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, textTransform: 'uppercase', color: 'rgba(15,23,18,0.5)', marginBottom: 6 }}>
                      Ajouter un verre
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {glasses.map((g) => (
                        <label key={g.id} style={{ fontFamily: 'Space Mono, monospace', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(15,23,18,0.7)' }}>
                          <input
                            type="checkbox"
                            checked={selectedGlassIds.has(g.id)}
                            onChange={(e) => toggleGlass(beer.id, g.id, e.target.checked)}
                          />
                          {g.name} — {g.volumeCl}cl ({g.price.toFixed(2)} €)
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ background: 'var(--paper-warm)', border: '1px solid var(--line)', padding: 24, marginTop: 24 }}>
        <h2 style={{ color: 'var(--pine)', marginTop: 0, marginBottom: 16 }}>Votre commande</h2>

        {!hasItems ? (
          <p style={{ color: 'rgba(15,23,18,0.5)', fontSize: 13.5 }}>Choisissez des quantités ci-dessus pour composer votre commande.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', fontSize: 13.5 }}>
            {beerLines.map((l) => (
              <li key={`${l.beer.id}-${l.format}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{l.quantity} × {l.beer.name} ({l.format}cl)</span>
                <span style={{ fontFamily: 'Space Mono, monospace' }}>{l.lineTotal.toFixed(2)} €</span>
              </li>
            ))}
            {glassLines.map((l) => (
              <li key={`glass-${l.beer.id}-${l.glass.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--copper)' }}>
                <span>+ {l.glass.name} {l.glass.volumeCl}cl ({l.beer.name})</span>
                <span style={{ fontFamily: 'Space Mono, monospace' }}>{l.lineTotal.toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        )}

        {hasItems && (
          <>
            {remainingForFreeShipping > 0 && !pickup && town !== 'Bondues' ? (
              <p style={{ fontSize: 13, color: 'var(--copper)', marginBottom: 4 }}>
                🚚 Plus que {remainingForFreeShipping.toFixed(2)} € d'achat pour la livraison gratuite (sinon {DELIVERY_FEE.toFixed(2)} €).
              </p>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--pine)', marginBottom: 4 }}>🚚 Livraison gratuite !</p>
            )}
            {subtotal >= FREE_SHIPPING_THRESHOLD && (
              <p style={{ fontSize: 13, color: 'var(--copper)', marginBottom: 4 }}>
                🎁 À partir de {FREE_SHIPPING_THRESHOLD.toFixed(0)} € : un cadeau surprise bientôt disponible sur vos premières commandes.
              </p>
            )}
          </>
        )}

        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13.5, borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Sous-total</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Livraison</span>
            <span>{deliveryFee > 0 ? `${deliveryFee.toFixed(2)} €` : 'Gratuite'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginTop: 8 }}>
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, margin: '20px 0 16px' }}>
          <button
            type="button"
            onClick={() => setPickup(false)}
            className="btn"
            style={!pickup ? {} : { background: 'transparent', color: 'var(--pine)' }}
          >
            Livraison
          </button>
          <button
            type="button"
            onClick={() => setPickup(true)}
            className="btn"
            style={pickup ? {} : { background: 'transparent', color: 'var(--pine)' }}
          >
            Retrait à Bondues
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {pickup ? (
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <label>Adresse de retrait</label>
              <p style={{ margin: 0, fontSize: 14, padding: 12, border: '1px solid var(--line)', borderRadius: 3, background: 'var(--paper)' }}>
                📍 {PICKUP_ADDRESS}
              </p>
            </div>
          ) : (
            <div className="field" style={{ flex: 1, minWidth: 180 }}>
              <label>Commune de livraison</label>
              <select value={town} onChange={(e) => setTown(e.target.value)}>
                {TOWNS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          )}
          <div className="field" style={{ flex: 1, minWidth: 220 }}>
            <label>Créneau de {pickup ? 'retrait' : 'livraison'}</label>
            <select value={slot} onChange={(e) => setSlot(e.target.value)}>
              {slots.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {status.message && (
          <p style={{ color: status.type === 'error' ? '#A32D2D' : 'var(--pine)', fontSize: 13.5, marginTop: 4 }}>{status.message}</p>
        )}

        {loggedIn === false && (
          <p style={{ fontSize: 13.5, marginTop: 4 }}>
            <a href="/compte" style={{ color: 'var(--copper)' }}>Connectez-vous ou créez un compte</a> pour valider votre commande.
          </p>
        )}

        <button type="submit" className="btn" disabled={submitting || loggedIn === false} style={{ marginTop: 16 }}>
          {submitting ? 'Envoi…' : 'Valider la commande'}
        </button>
      </form>
    </div>
  );
}

function QuantityField({ label, value, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'rgba(15,23,18,0.6)', marginBottom: 6 }}>{label}</label>
      <input
        type="number"
        min={0}
        max={99}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 70, padding: 8, border: '1px solid var(--line)', borderRadius: 3, fontFamily: 'Public Sans, sans-serif', fontSize: 14 }}
      />
    </div>
  );
}
