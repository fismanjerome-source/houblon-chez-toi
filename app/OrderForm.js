'use client';
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import FlagIcon from './components/FlagIcon';
import BasketCard from './components/BasketCard';
const { FREE_SHIPPING_THRESHOLD_CENTS, DELIVERY_FEE_CENTS, PICKUP_ADDRESS, computeDeliveryFeeCents } = require('../lib/delivery');
const { computeVolumeDiscount } = require('../lib/pricing');
const { BEER_COLORS } = require('./components/beerColors');
const { TOWN_NAMES, townLabel } = require('../lib/towns');

const TOWNS = TOWN_NAMES;
const FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD_CENTS / 100;
const DELIVERY_FEE = DELIVERY_FEE_CENTS / 100;

const TXT = {
  fr: {
    addGlass: 'Ajouter un verre',
    viewSheet: 'Voir la fiche complète →',
    consigne: 'consigne',
    boutique: 'Boutique',
    yourOrder: 'Votre commande',
    chooseQty: 'Choisissez des quantités ci-dessus pour composer votre commande.',
    deposit: (name, format) => `+ consigne ${name} (${format}cl)`,
    returnLine: (qty, name, format) => `− reprise ${qty} × ${name} (${format}cl)`,
    returnSummary: '♻️ Rendre des bouteilles consignées (recrédité sur cette commande)',
    freeShippingRemaining: (amount, fee) => `🚚 Plus que ${amount} € d'achat pour la livraison gratuite (sinon ${fee} €).`,
    freeShipping: '🚚 Livraison gratuite !',
    giftPromo: (threshold) => `🎁 À partir de ${threshold} € : un cadeau surprise bientôt disponible sur vos premières commandes.`,
    subtotalBeers: (hasGlass) => `Sous-total bières${hasGlass ? ' + verres' : ''}`,
    deposits: 'Consignes',
    delivery: 'Livraison',
    free: 'Gratuite',
    returnDeposits: 'Reprise consignes',
    proDiscount: (pct) => `Remise volume pro (−${pct}%)`,
    total: 'Total',
    deliveryBtn: 'Livraison',
    pickupBtn: 'Retrait à Bondues',
    pickupAddressLabel: 'Adresse de retrait',
    townLabel: 'Commune de livraison',
    slotLabel: (pickup) => `Créneau de ${pickup ? 'retrait' : 'livraison'}`,
    loginPromptLink: 'Connectez-vous ou créez un compte',
    loginPromptSuffix: 'pour valider votre commande.',
    paymentModeLabel: 'Mode de paiement (compte pro)',
    payNet30: '📅 Payer à 30 jours après livraison (facture envoyée par email)',
    payStripe: '💳 Payer maintenant par carte (paiement sécurisé Stripe)',
    termsPrefix: "J'ai pris connaissance des",
    termsLink: 'CGU/CGV',
    submitting: 'Envoi…',
    submit: 'Valider la commande',
    bottleAlt: 'Bouteille',
    glassAlt: 'Verre',
    errCart: 'Ajoutez au moins un article à votre commande.',
    errTerms: 'Merci de confirmer avoir pris connaissance des CGU/CGV.',
    errGeneric: 'Impossible de valider la commande.',
    success: 'Commande envoyée ! Retrouvez-la dans "Mon compte".',
    codeLabel: 'Code promo / parrainage (facultatif)',
    codePlaceholder: 'Ex : JEROME482',
    credit: 'Crédit utilisé',
    madeInFrance: 'Fabriqué en France',
  },
  nl: {
    addGlass: 'Glas toevoegen',
    viewSheet: 'Bekijk de volledige fiche →',
    consigne: 'statiegeld',
    boutique: 'Winkel',
    yourOrder: 'Uw bestelling',
    chooseQty: 'Kies hierboven de hoeveelheden om uw bestelling samen te stellen.',
    deposit: (name, format) => `+ statiegeld ${name} (${format}cl)`,
    returnLine: (qty, name, format) => `− terugname ${qty} × ${name} (${format}cl)`,
    returnSummary: '♻️ Statiegeldflessen inleveren (verrekend met deze bestelling)',
    freeShippingRemaining: (amount, fee) => `🚚 Nog maar ${amount} € nodig voor gratis levering (anders ${fee} €).`,
    freeShipping: '🚚 Gratis levering!',
    giftPromo: (threshold) => `🎁 Vanaf ${threshold} €: binnenkort een verrassingscadeau bij uw eerste bestellingen.`,
    subtotalBeers: (hasGlass) => `Subtotaal bieren${hasGlass ? ' + glazen' : ''}`,
    deposits: 'Statiegeld',
    delivery: 'Levering',
    free: 'Gratis',
    returnDeposits: 'Terugname statiegeld',
    proDiscount: (pct) => `Volumekorting pro (−${pct}%)`,
    total: 'Totaal',
    deliveryBtn: 'Levering',
    pickupBtn: 'Afhalen in Bondues',
    pickupAddressLabel: 'Ophaaladres',
    townLabel: 'Leveringsgemeente',
    slotLabel: (pickup) => `${pickup ? 'Ophaal' : 'Leverings'}moment`,
    loginPromptLink: 'Log in of maak een account aan',
    loginPromptSuffix: 'om uw bestelling te bevestigen.',
    paymentModeLabel: 'Betaalmethode (pro-account)',
    payNet30: '📅 Betalen binnen 30 dagen na levering (factuur per e-mail)',
    payStripe: '💳 Nu betalen met kaart (beveiligde betaling via Stripe)',
    termsPrefix: 'Ik heb kennis genomen van de',
    termsLink: 'algemene voorwaarden',
    submitting: 'Verzenden…',
    submit: 'Bestelling bevestigen',
    bottleAlt: 'Fles',
    glassAlt: 'Glas',
    errCart: 'Voeg minstens één artikel toe aan uw bestelling.',
    errTerms: 'Bevestig dat u kennis heeft genomen van de algemene voorwaarden.',
    errGeneric: 'De bestelling kon niet worden bevestigd.',
    success: 'Bestelling verzonden! U vindt ze terug bij "Mijn account".',
    codeLabel: 'Kortingscode / doorverwijzingscode (optioneel)',
    codePlaceholder: 'Bv.: JEROME482',
    credit: 'Gebruikt tegoed',
    madeInFrance: 'Gemaakt in Frankrijk',
  },
};

export default function OrderForm({ groups, slots, basket, merchProducts, pricingTiers, locale = 'fr' }) {
  const t = TXT[locale] || TXT.fr;
  const beers = groups.flatMap((g) => g.beers);
  const [qty, setQty] = useState({}); // { [beerId-format]: quantity }
  const [glassChoice, setGlassChoice] = useState({}); // { [beerId]: Set<glassId> }
  const [basketQty, setBasketQty] = useState(0);
  const [merchQty, setMerchQty] = useState({}); // { [merchId]: quantity }
  const [user, setUser] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState('NET_30');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [selectedVariant, setSelectedVariant] = useState({}); // { [brand]: beerId } — variante affichée dans l'encadré groupé

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
    fetch('/api/auth/me').then(async (res) => {
      setLoggedIn(res.ok);
      if (res.ok) setUser(await res.json());
    });
  }, []);

  // Arrivée depuis la fiche d'une variante (ex: #beer-xxx) : on la pré-sélectionne
  // dans l'encadré groupé de sa marque, pour que "Commander cette bière" fonctionne.
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#beer-(.+)$/);
    if (!match) return;
    const targetBeer = beers.find((b) => b.id === match[1]);
    if (targetBeer && targetBeer.brand) {
      setSelectedVariant((prev) => ({ ...prev, [targetBeer.brand]: targetBeer.id }));
    }
  }, [beers]);

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

  const totalBottles = beerLines.reduce((sum, l) => sum + l.quantity, 0);
  const proDiscount = user?.proApproved && pricingTiers?.length
    ? computeVolumeDiscount({ totalBottles, discountableCents: Math.round(itemsSubtotal * 100), tiers: pricingTiers })
    : { discountCents: 0, discountPercent: 0 };
  const discountAmount = proDiscount.discountCents / 100;

  const availableCredit = (user?.creditCents || 0) / 100;
  const beforeCredit = Math.max(0, subtotal + deliveryFee - depositCredited - discountAmount);
  const creditApplied = Math.min(availableCredit, beforeCredit);

  const total = Math.max(0, beforeCredit - creditApplied);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - itemsSubtotal);
  const hasItems = beerLines.length > 0 || extrasLines.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (!hasItems) {
      setStatus({ type: 'error', message: t.errCart });
      return;
    }
    if (!acceptedTerms) {
      setStatus({ type: 'error', message: t.errTerms });
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
      body: JSON.stringify({
        town, pickup, slot, items, returns: returnItems, extras: extraItems, acceptedTerms,
        paymentChoice: user?.proApproved ? paymentChoice : undefined,
        code: promoCodeInput || undefined,
      }),
    });
    if (!res.ok) {
      setSubmitting(false);
      const data = await res.json().catch(() => ({}));
      setStatus({ type: 'error', message: data.error || t.errGeneric });
      return;
    }
    const data = await res.json();
    if (data.stripeCheckoutUrl) {
      window.location.href = data.stripeCheckoutUrl;
      return;
    }
    setSubmitting(false);
    setQty({});
    setGlassChoice({});
    setReturns({});
    setBasketQty(0);
    setMerchQty({});
    setAcceptedTerms(false);
    setPromoCodeInput('');
    setStatus({ type: 'success', message: t.success });
  }

  function renderBeerCard(beer, { anchorIds = [beer.id], siblingsStrip = null } = {}) {
    const color = BEER_COLORS[beer.name] || 'var(--line)';
    const glasses = beer.glasses || [];
    const selectedGlassIds = glassChoice[beer.id] || new Set();
    const beerDescription = locale === 'nl' && beer.descriptionNl ? beer.descriptionNl : beer.description;
    const beerTastingNote = locale === 'nl' && beer.tastingNoteNl ? beer.tastingNoteNl : beer.tastingNote;
    const beerOrigin = locale === 'nl' && beer.originNl ? beer.originNl : beer.origin;
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
        {anchorIds.filter((id) => id !== beer.id).map((id) => (
          <span key={id} id={`beer-${id}`} style={{ position: 'absolute', scrollMarginTop: 90 }} />
        ))}
        {(beer.bottleImageUrl || previewGlassImage) && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexShrink: 0, width: 140 }}>
            <div style={{ position: 'relative', width: 70, height: 200 }}>
              {beer.bottleImageUrl && (
                <Image
                  src={beer.bottleImageUrl}
                  alt={`${t.bottleAlt} ${beer.name}`}
                  fill
                  sizes="70px"
                  style={{ objectFit: 'contain', objectPosition: 'bottom' }}
                />
              )}
            </div>
            <div style={{ position: 'relative', width: 60, height: 200 }}>
              {previewGlassImage && (
                <Image
                  src={previewGlassImage}
                  alt={`${t.glassAlt} ${beer.name}`}
                  fill
                  sizes="60px"
                  style={{ objectFit: 'contain', objectPosition: 'bottom' }}
                />
              )}
            </div>
          </div>
        )}
        {siblingsStrip}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a href={`/bieres/${beer.id}`} style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: 'var(--pine)', textDecoration: 'none' }}>
              {beer.name}
            </a>
            <FlagIcon country={beer.country} />
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'rgba(var(--ink-rgb),0.5)', margin: '4px 0 10px' }}>
            {beerOrigin}{beer.abv > 0 && ` · ${beer.abv}% vol.`}
          </div>
          <p style={{ fontSize: 13.5, color: 'rgba(var(--ink-rgb),0.7)' }}>{beerDescription}</p>
          {beerTastingNote && (
            <p style={{ fontSize: 13, color: 'var(--copper)', fontStyle: 'italic', marginTop: -4, marginBottom: 4 }}>
              « {beerTastingNote} »
            </p>
          )}
          <a href={`/bieres/${beer.id}`} style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--pine)', textDecoration: 'underline' }}>
            {t.viewSheet}
          </a>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-end', marginTop: 14 }}>
            {beer.price33 > 0 && (
              <QuantityField
                label={`33cl — ${beer.price33.toFixed(2)} €`}
                sublabel={beer.depositCents33 > 0 ? `+ ${(beer.depositCents33 / 100).toFixed(2)} € ${t.consigne}` : null}
                value={qty[`${beer.id}-33`] || 0}
                onChange={(v) => setQuantity(beer.id, 33, v)}
              />
            )}
            {beer.price75 > 0 && (
              <QuantityField
                label={`75cl — ${beer.price75.toFixed(2)} €`}
                sublabel={beer.depositCents75 > 0 ? `+ ${(beer.depositCents75 / 100).toFixed(2)} € ${t.consigne}` : null}
                value={qty[`${beer.id}-75`] || 0}
                onChange={(v) => setQuantity(beer.id, 75, v)}
              />
            )}
          </div>

          {glasses.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, textTransform: 'uppercase', color: 'rgba(var(--ink-rgb),0.5)', marginBottom: 6 }}>
                {t.addGlass}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {glasses.map((g) => (
                  <label key={g.id} style={{ fontFamily: 'Space Mono, monospace', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(var(--ink-rgb),0.7)' }}>
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
  }

  function renderBrandGroup(brand, variants) {
    const defaultVariant = variants.find((v) => (v.style || '').toLowerCase() === 'blonde') || variants[0];
    const activeId = selectedVariant[brand] && variants.some((v) => v.id === selectedVariant[brand])
      ? selectedVariant[brand]
      : defaultVariant.id;
    const activeBeer = variants.find((v) => v.id === activeId) || defaultVariant;

    const strip = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        {variants.map((v) => (
          <a
            key={v.id}
            href={`/bieres/${v.id}`}
            onClick={(e) => {
              e.preventDefault();
              setSelectedVariant((prev) => ({ ...prev, [brand]: v.id }));
            }}
            title={`${v.style || v.name} — ${v.price33 > 0 ? v.price33.toFixed(2) + ' €' : v.price75.toFixed(2) + ' €'}`}
            style={{
              position: 'relative', width: 34, height: 34, borderRadius: '50%', overflow: 'hidden',
              background: 'var(--surface)', border: v.id === activeId ? '2px solid var(--amber)' : '1px solid var(--line)',
              display: 'block', cursor: 'pointer',
            }}
          >
            {v.bottleImageUrl && (
              <Image src={v.bottleImageUrl} alt={v.style || v.name} fill sizes="34px" style={{ objectFit: 'contain', objectPosition: 'bottom' }} />
            )}
          </a>
        ))}
      </div>
    );

    return renderBeerCard(activeBeer, { anchorIds: variants.map((v) => v.id), siblingsStrip: strip });
  }

  function groupByBrand(beersInGroup) {
    const order = [];
    const map = new Map();
    for (const beer of beersInGroup) {
      const key = beer.brand || beer.id;
      if (!map.has(key)) { map.set(key, []); order.push(key); }
      map.get(key).push(beer);
    }
    return order.map((key) => ({ brand: key, variants: map.get(key) }));
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group.title}>
          <h2 style={{ color: 'var(--pine)', margin: '40px 0 16px' }}>{group.title}</h2>
          {groupByBrand(group.beers).map(({ brand, variants }) => (
            <div key={brand}>
              {variants.length > 1 ? renderBrandGroup(brand, variants) : renderBeerCard(variants[0])}
            </div>
          ))}
        </div>
      ))}

      {basket && (
        <BasketCard
          basket={basket}
          quantity={basketQty}
          onChange={(v) => setBasketQty(Math.max(0, Math.min(9, Number(v) || 0)))}
          locale={locale}
        />
      )}

      {merchProducts && merchProducts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>{t.boutique}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {merchProducts.map((m) => {
              const merchDescription = locale === 'nl' && m.descriptionNl ? m.descriptionNl : m.description;
              const isEcocup = m.name.toLowerCase().includes('ecocup');
              return (
              <div key={m.id} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, padding: 16, flex: '1 1 220px', minWidth: 200 }}>
                {m.imageUrl && (
                  <div style={{ position: 'relative', width: '100%', height: 120, marginBottom: 10 }}>
                    <Image src={m.imageUrl} alt={m.name} fill sizes="220px" style={{ objectFit: 'contain' }} />
                  </div>
                )}
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: 'var(--pine)', marginBottom: 4 }}>{m.name}</div>
                {isEcocup && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--pine)', marginBottom: 8, background: 'rgba(var(--ink-rgb),0.05)', padding: '3px 8px', borderRadius: 20 }}>
                    <FlagIcon country="FR" size={14} />
                    {t.madeInFrance}
                  </div>
                )}
                {merchDescription && <p style={{ fontSize: 12.5, color: 'rgba(var(--ink-rgb),0.65)', marginBottom: 10 }}>{merchDescription}</p>}
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
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'var(--paper-warm)', border: '1px solid var(--line)', padding: 24, marginTop: 24 }}>
        <h2 style={{ color: 'var(--pine)', marginTop: 0, marginBottom: 16 }}>{t.yourOrder}</h2>

        {!hasItems ? (
          <p style={{ color: 'rgba(var(--ink-rgb),0.5)', fontSize: 13.5 }}>{t.chooseQty}</p>
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
                <span>{t.deposit(l.beer.name, l.format)}</span>
                <span style={{ fontFamily: 'Space Mono, monospace' }}>{l.depositTotal.toFixed(2)} €</span>
              </li>
            ))}
            {returnLines.map((l) => (
              <li key={`return-${l.beer.id}-${l.format}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: 'var(--pine)', fontSize: 12.5 }}>
                <span>{t.returnLine(l.quantity, l.beer.name, l.format)}</span>
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
              {t.returnSummary}
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
                {t.freeShippingRemaining(remainingForFreeShipping.toFixed(2), DELIVERY_FEE.toFixed(2))}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--pine)', marginBottom: 4 }}>{t.freeShipping}</p>
            )}
            {itemsSubtotal >= FREE_SHIPPING_THRESHOLD && (
              <p style={{ fontSize: 13, color: 'var(--copper)', marginBottom: 4 }}>
                {t.giftPromo(FREE_SHIPPING_THRESHOLD.toFixed(0))}
              </p>
            )}
          </>
        )}

        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 13.5, borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{t.subtotalBeers(glassLines.length > 0)}</span>
            <span>{itemsSubtotal.toFixed(2)} €</span>
          </div>
          {depositCharged > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span>{t.deposits}</span>
              <span>{depositCharged.toFixed(2)} €</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{t.delivery}</span>
            <span>{deliveryFee > 0 ? `${deliveryFee.toFixed(2)} €` : t.free}</span>
          </div>
          {depositCredited > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--pine)' }}>
              <span>{t.returnDeposits}</span>
              <span>−{depositCredited.toFixed(2)} €</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--pine)' }}>
              <span>{t.proDiscount(proDiscount.discountPercent)}</span>
              <span>−{discountAmount.toFixed(2)} €</span>
            </div>
          )}
          {creditApplied > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--pine)' }}>
              <span>{t.credit}</span>
              <span>−{creditApplied.toFixed(2)} €</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, marginTop: 8 }}>
            <span>{t.total}</span>
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
            {t.deliveryBtn}
          </button>
          <button
            type="button"
            onClick={() => setPickup(true)}
            className="btn"
            style={pickup ? {} : { background: 'transparent', color: 'var(--pine)' }}
          >
            {t.pickupBtn}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {pickup ? (
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <label>{t.pickupAddressLabel}</label>
              <p style={{ margin: 0, fontSize: 14, padding: 12, border: '1px solid var(--line)', borderRadius: 3, background: 'var(--paper)' }}>
                📍 {PICKUP_ADDRESS}
              </p>
            </div>
          ) : (
            <div className="field" style={{ flex: 1, minWidth: 180 }}>
              <label>{t.townLabel}</label>
              <select value={town} onChange={(e) => setTown(e.target.value)}>
                {TOWNS.map((townName) => <option key={townName} value={townName}>{townLabel(townName)}</option>)}
              </select>
            </div>
          )}
          <div className="field" style={{ flex: 1, minWidth: 220 }}>
            <label>{t.slotLabel(pickup)}</label>
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
            <a href="/compte" style={{ color: 'var(--copper)' }}>{t.loginPromptLink}</a> {t.loginPromptSuffix}
          </p>
        )}

        {user?.proApproved && (
          <div style={{ marginTop: 14, padding: 14, border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, textTransform: 'uppercase', color: 'rgba(var(--ink-rgb),0.5)', marginBottom: 8 }}>
              {t.paymentModeLabel}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, marginBottom: 6, cursor: 'pointer' }}>
              <input type="radio" name="paymentChoice" checked={paymentChoice === 'NET_30'} onChange={() => setPaymentChoice('NET_30')} />
              {t.payNet30}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer' }}>
              <input type="radio" name="paymentChoice" checked={paymentChoice === 'STRIPE'} onChange={() => setPaymentChoice('STRIPE')} />
              {t.payStripe}
            </label>
          </div>
        )}

        {loggedIn !== false && (
          <div className="field" style={{ marginTop: 14, marginBottom: 0 }}>
            <label>{t.codeLabel}</label>
            <input
              type="text"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value)}
              placeholder={t.codePlaceholder}
              style={{ maxWidth: 220, textTransform: 'uppercase' }}
            />
          </div>
        )}

        {loggedIn !== false && (
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, marginTop: 14, color: 'rgba(var(--ink-rgb),0.75)' }}>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              style={{ marginTop: 2 }}
            />
            <span>
              {t.termsPrefix}{' '}
              <a href="/cgu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pine)' }}>{t.termsLink}</a>.
            </span>
          </label>
        )}

        <button type="submit" className="btn" disabled={submitting || loggedIn === false || !acceptedTerms} style={{ marginTop: 16 }}>
          {submitting ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  );
}

function QuantityField({ label, sublabel, value, onChange }) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'rgba(var(--ink-rgb),0.6)', marginBottom: 6 }}>{label}</label>
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
