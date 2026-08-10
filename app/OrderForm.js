'use client';
import { useState, useEffect, useMemo } from 'react';
import FlagIcon from './components/FlagIcon';
import BasketCard from './components/BasketCard';
const { FREE_SHIPPING_THRESHOLD_CENTS, DELIVERY_FEE_CENTS, PICKUP_ADDRESS, computeDeliveryFeeCents } = require('../lib/delivery');
const { BEER_COLORS } = require('./components/beerColors');
const { TOWN_NAMES, townLabel } = require('../lib/towns');

const TOWNS = TOWN_NAMES;
const FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD_CENTS / 100;
const DELIVERY_FEE = DELIVERY_FEE_CENTS / 100;

export default function OrderForm({ groups, slots, basket, merchProducts }) {
  const beers = groups.flatMap((g) => g.beers);
  const [qty, setQty] = useState({}); // { [beerId-format]: quantity }
  const [glassChoice, setGlassChoice] = useState({}); // { [beerId]: Set<glassId> }
  const [basketQty, setBasketQty] = useState(0);
  const [merchQty, setMerchQty] = useState({}); // { [merchId]: quantity }

  function toggleGlass(beerId, glassId, checked) {
    setGlassChoice((prev) => {
      const current = new Set(prev[beerId] || []);
      if (checked) current.add(glassId);
      else current.delete(glassId);
      return { ...prev, [beerId]: current };
    });
  }
  const [returns, setReturns] = useState({}); // { [beerId-format]: quantity }
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

  function setReturnQty(beerId, format, value) {
    const n = Math.max(0, Math.min(999, Number(value) || 0));
    setReturns((r) => ({ ...r, [`${beerId}-${format}`]: n }));
  }

  function depositRate(beer, format) {
    return (format === 75 ? beer.depositCents75 : beer.depositCents33) / 100;
  }

  const beerLines = useMemo(() => {
    return beers.flatMap((beer) => {
      const items = [];
      for (const format of [33, 75]) {
        const quantity = qty[`${beer.id}-${format}`] || 0;
        if (quantity > 0) {
          const unitPrice = format === 75 ? beer.price75 : beer.price33;
          const depositUnit = depositRate(beer, format);
          items.push({ beer, format, quantity, lineTotal: unitPrice * quantity, depositTotal: depositUnit * quantity });
        }
      }
      return items;
    });
  }, [beers, qty]);

  const depositEligibleBeers = useMemo(() => beers.filter((b) => b.depositCents33 > 0 || b.depositCents75 > 0), [beers]);

  const returnLines = useMemo(() => {
    return depositEligibleBeers.flatMap((beer) => {
      const items = [];
      for (const format of [33, 75]) {
        const quantity = returns[`${beer.id}-${format}`] || 0;
        const rate = depositRate(beer, format);
        if (quantity > 0 && rate > 0) {
          items.push({ beer, format, quantity, creditTotal: rate * quantity });
        }
      }
      return items;
    });
  }, [depositEligibleBeers, returns]);

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

  const extrasLines = useMemo(() => {
    const lines = [];
    if (basket && basketQty > 0) {
      lines.push({ kind: 'basket', refId: basket.id, name: basket.name, quantity: basketQty, lineTotal: (basket.priceCents / 100) * basketQty });
    }
    (merchProducts || []).forEach((m) => {
      const q = merchQty[m.id] || 0;
      if (q > 0) lines.push({ kind: 'merch', refId: m.id, name: m.name, quantity: q, lineTotal: (m.priceCents / 100) * q });
    });
    return lines;
  }, [basket, basketQty, merchProducts, merchQty]);

  const itemsSubtotal = beerLines.reduce((sum, l) => sum + l.lineTotal, 0) + glassLines.reduce((sum, l) => sum + l.lineTotal, 0) + extrasLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const depositCharged = beerLines.reduce((sum, l) => sum + l.depositTotal, 0);
  const depositCredited = returnLines.reduce((sum, l) => sum + l.creditTotal, 0);
  const subtotal = itemsSubtotal + depositCharged;
  const deliveryFee = computeDeliveryFeeCents({ pickup, town, itemsTotalCents: Math.round(itemsSubtotal * 100) }) / 100;
  const total = Math.max(0, subtotal + deliveryFee - depositCredited);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - itemsSubtotal);
  const hasItems = beerLines.length > 0 || extrasLines.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (!hasItems) {
      setStatus({ type: 'error', message: 'Ajoutez au moins un article à votre commande.' });
      return;
    }
    setSubmitting(true);

    const items = [
      ...beerLines.map((l) => ({ beerId: l.beer.id, format: l.format, quantity: l.quantity, glassId: null })),
      ...glassLines.map((l) => ({ beerId: l.beer.id, format: 0, quantity: 1, glassId: l.glass.id })),
    ];
    const returnItems = returnLines.map((l) => ({ beerId: l.beer.id, format: l.format, quantity: l.quantity }));
    const extraItems = extrasLines.map((l) => ({ kind: l.kind, refId: l.refId, quantity: l.quantity }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ town, pickup, slot, items, returns: returnItems, extras: extraItems }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ type: 'error', message: data.error || 'Impossible de valider la commande.' });
      return;
    }
    setQty({});
    setGlassChoice({});
    setReturns({});
    setBasketQty(0);
    setMerchQty({});
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
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0, width: 140 }}>
                  <div style={{ width: 70, height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {beer.bottleImageUrl && (
                      <img
                        src={beer.bottleImageUrl}
                        alt={`Bouteille ${beer.name}`}
                        style={{ maxWidth: 70, maxHeight: 200, objectFit: 'contain' }}
                      />
                    )}
                  </div>
                  <div style={{ width: 60, height: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    {previewGlassImage && (
                      <img
                        src={previewGlassImage}
                        alt={`Verre ${beer.name}`}
                        style={{ maxWidth: 60, maxHeight: 170, objectFit: 'contain' }}
                      />
                    )}
                  </div>
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
                      sublabel={beer.depositCents33 > 0 ? `+ ${(beer.depositCents33 / 100).toFixed(2)} € consigne` : null}
                      value={qty[`${beer.id}-33`] || 0}
                      onChange={(v) => setQuantity(beer.id, 33, v)}
                    />
                  )}
                  {beer.price75 > 0 && (
                    <QuantityField
                      label={`75cl — ${beer.price75.toFixed(2)} €`}
                      sublabel={beer.depositCents75 > 0 ? `+ ${(beer.depositCents75 / 100).toFixed(2)} € consigne` : null}
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

      {basket && (
        <BasketCard
          basket={basket}
          quantity={basketQty}
          onChange={(v) => setBasketQty(Math.max(0, Math.min(9, Number(v) || 0)))}
        />
      )}

      {merchProducts && merchProducts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>Boutique</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {merchProducts.map((m) => (
              <div key={m.id} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 16, flex: '1 1 220px', minWidth: 200 }}>
                {m.imageUrl && <img src={m.imageUrl} alt={m.name} style={{ width: '100%', height: 120, objectFit: 'contain', marginBottom: 10 }} />}
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: 'var(--pine)', marginBottom: 4 }}>{m.name}</div>
                {m.description && <p style={{ fontSize: 12.5, color: 'rgba(15,23,18,0.65)', marginBottom: 10 }}>{m.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14 }}>{(m.priceCents / 100).toFixed(2)} €</span>
                  <input
                    type="number" min={0} max={20}
                    value={merchQty[m.id] === 0 || !merchQty[m.id] ? '' : merchQty[m.id]}
                    placeholder="0"
                    onChange={(e) => setMerchQty((q) => ({ ...q, [m.id]: Math.max(0, Math.min(20, Number(e.target.value) || 0)) }))}
                    onFocus={(e) => e.target.select()}
                    style={{ width: 55, padding: 6, border: '1px solid var(--line)', borderRadius: 3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            {beerLines.filter((l) => l.depositTotal > 0).map((l) => (
              <li key={`deposit-${l.beer.id}-${l.format}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--copper)', fontSize: 12.5 }}>
                <span>+ consigne {l.beer.name} ({l.format}cl)</span>
                <span style={{ fontFamily: 'Space Mono, monospace' }}>{l.depositTotal.toFixed(2)} €</span>
              </li>
            ))}
            {returnLines.map((l) => (
              <li key={`return-${l.beer.id}-${l.format}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--pine)', fontSize: 12.5 }}>
                <span>− reprise {l.quantity} × {l.beer.name} ({l.format}cl)</span>
                <span style={{ fontFamily: 'Space Mono, monospace' }}>−{l.creditTotal.toFixed(2)} €</span>
              </li>
            ))}
            {extrasLines.map((l) => (
              <li key={`extra-${l.kind}-${l.refId}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{l.quantity} × {l.name}</span>
                <span style={{ fontFamily: 'Space Mono, monospace' }}>{l.lineTotal.toFixed(2)} €</span>
              </li>
            ))}
          </ul>
        )}

        {depositEligibleBeers.length > 0 && (
          <details style={{ marginBottom: 16, fontSize: 13 }}>
            <summary style={{ cursor: 'pointer', fontFamily: 'Space Mono, monospace', fontSize: 11.5, color: 'var(--pine)' }}>
              ♻️ Rendre des bouteilles consignées (recrédité sur cette commande)
            </summary>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {depositEligibleBeers.map((beer) => (
                <div key={beer.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, minWidth: 140 }}>{beer.name}</span>
                  {beer.depositCents33 > 0 && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
                      33cl
                      <input
                        type="number" min={0} max={999}
                        value={returns[`${beer.id}-33`] || ''}
                        placeholder="0"
                        onChange={(e) => setReturnQty(beer.id, 33, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        style={{ width: 55, padding: 6, border: '1px solid var(--line)', borderRadius: 3 }}
                      />
                    </label>
                  )}
                  {beer.depositCents75 > 0 && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
                      75cl
                      <input
                        type="number" min={0} max={999}
                        value={returns[`${beer.id}-75`] || ''}
                        placeholder="0"
                        onChange={(e) => setReturnQty(beer.id, 75, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        style={{ width: 55, padding: 6, border: '1px solid var(--line)', borderRadius: 3 }}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </details>
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
            {itemsSubtotal >= FREE_SHIPPING_THRESHOLD && (
              <p style={{ fontSize: 13, color: 'var(--copper)', marginBottom: 4 }}>
                🎁 À partir de {FREE_SHIPPING_THRESHOLD.toFixed(0)} € : un cadeau surprise bientôt disponible sur vos premières commandes.
              </p>
            )}
          </>
        )}

        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13.5, borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Sous-total bières{glassLines.length > 0 ? ' + verres' : ''}</span>
            <span>{itemsSubtotal.toFixed(2)} €</span>
          </div>
          {depositCharged > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>Consignes</span>
              <span>{depositCharged.toFixed(2)} €</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>Livraison</span>
            <span>{deliveryFee > 0 ? `${deliveryFee.toFixed(2)} €` : 'Gratuite'}</span>
          </div>
          {depositCredited > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--pine)' }}>
              <span>Reprise consignes</span>
              <span>−{depositCredited.toFixed(2)} €</span>
            </div>
          )}
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
                {TOWNS.map((t) => <option key={t} value={t}>{townLabel(t)}</option>)}
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

function QuantityField({ label, sublabel, value, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'rgba(15,23,18,0.6)', marginBottom: 6 }}>{label}</label>
      <input
        type="number"
        min={0}
        max={99}
        value={value === 0 ? '' : value}
        placeholder="0"
        onChange={(e) => onChange(e.target.value === '' ? '0' : e.target.value)}
        onFocus={(e) => e.target.select()}
        style={{ width: 70, padding: 8, border: '1px solid var(--line)', borderRadius: 3, fontFamily: 'Public Sans, sans-serif', fontSize: 14 }}
      />
      {sublabel && (
        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9.5, color: 'var(--copper)', marginTop: 3 }}>{sublabel}</div>
      )}
    </div>
  );
}
