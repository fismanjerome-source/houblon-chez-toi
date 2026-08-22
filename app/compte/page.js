'use client';
import { useState, useEffect } from 'react';
const { TOWN_NAMES, townLabel } = require('../../lib/towns');

const STATUS_LABELS = {
  EN_ATTENTE_PAIEMENT: 'En attente de paiement',
  EN_PREPARATION: 'En préparation',
  EN_LIVRAISON: 'En livraison',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
};

export default function ComptePage() {
  const [mode, setMode] = useState('login');
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', town: 'Bondues', accountType: 'particulier', companyName: '' });
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwStatus, setPwStatus] = useState({ type: '', message: '' });
  const [paymentBanner, setPaymentBanner] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paiement') === 'reussi') {
      setPaymentBanner('Paiement reçu, merci ! Votre commande est en cours de confirmation (quelques instants).');
    } else if (params.get('paiement') === 'annule') {
      setPaymentBanner("Le paiement a été annulé — votre commande n'a pas été enregistrée.");
    }
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          loadOrders();
        }
        setCheckingSession(false);
      });
  }, []);

  async function loadOrders() {
    const res = await fetch('/api/orders');
    if (res.ok) setOrders(await res.json());
  }

  async function refreshUser() {
    const res = await fetch('/api/auth/me');
    if (res.ok) setUser(await res.json());
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    await refreshUser();
    loadOrders();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    await refreshUser();
    loadOrders();
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOrders([]);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwStatus({ type: '', message: '' });
    const res = await fetch('/api/auth/password', { method: 'PATCH', body: JSON.stringify(pwForm) });
    const data = await res.json();
    if (!res.ok) {
      setPwStatus({ type: 'error', message: data.error });
      return;
    }
    setPwForm({ currentPassword: '', newPassword: '' });
    setPwStatus({ type: 'success', message: 'Mot de passe mis à jour.' });
  }

  if (checkingSession) {
    return <main className="wrap" style={{ padding: '48px 0' }} />;
  }

  if (user) {
    return (
      <main className="wrap" style={{ padding: '48px 0' }}>
        {paymentBanner && (
          <p style={{ background: 'var(--paper-warm)', border: '2px solid var(--line)', borderRadius: 2, padding: 12, fontSize: 13.5, color: 'var(--pine)', marginBottom: 20 }}>
            {paymentBanner}
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ color: 'var(--pine)' }}>Bonjour {user.name?.split(' ')[0] || ''}</h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span onClick={() => setShowPasswordForm((v) => !v)} style={{ cursor: 'pointer', fontFamily: 'Public Sans, sans-serif', fontSize: 11, color: 'var(--pine)' }}>
              {showPasswordForm ? 'Fermer' : 'Changer le mot de passe'}
            </span>
            <span onClick={handleLogout} style={{ cursor: 'pointer', fontFamily: 'Public Sans, sans-serif', fontSize: 11, color: 'var(--copper)' }}>Se déconnecter</span>
          </div>
        </div>

        {user.referralCode && (
          <div style={{ background: 'var(--pine)', color: 'var(--paper)', borderRadius: 3, padding: 20, marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, letterSpacing: '0.08em', color: 'var(--amber)', marginBottom: 6 }}>PARRAINAGE</div>
              <p style={{ margin: '0 0 6px', fontSize: 14 }}>Offrez 5 € à un proche, gagnez 10 € de crédit dès sa 1ère commande livrée.</p>
              <div style={{ display: 'inline-block', background: 'color-mix(in srgb, var(--paper) 12%, transparent)', border: '1px dashed color-mix(in srgb, var(--paper) 40%, transparent)', borderRadius: 2, padding: '8px 18px', fontFamily: 'Public Sans, sans-serif', fontSize: 17, letterSpacing: '0.06em' }}>
                {user.referralCode}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, opacity: 0.75 }}>Crédit disponible</div>
              <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 22 }}>{((user.creditCents || 0) / 100).toFixed(2)} €</div>
            </div>
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} style={{ background: 'var(--paper-warm)', border: '2px solid var(--line)', padding: 20, marginBottom: 30, maxWidth: 380 }}>
            <div className="field">
              <label>Mot de passe actuel</label>
              <input type="password" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
            </div>
            <div className="field">
              <label>Nouveau mot de passe</label>
              <input type="password" required minLength={8} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
            </div>
            {pwStatus.message && (
              <p style={{ color: pwStatus.type === 'error' ? '#A32D2D' : 'var(--pine)', fontSize: 13, marginBottom: 12 }}>{pwStatus.message}</p>
            )}
            <button type="submit" className="btn">Valider</button>
          </form>
        )}

        <h2 style={{ fontSize: 18, marginBottom: 14 }}>Mes commandes</h2>
        {orders.length === 0 && <p style={{ color: 'rgba(var(--ink-rgb),0.5)' }}>Aucune commande pour le moment.</p>}
        {orders.map((o) => (
          <div key={o.id} style={{ border: '2px solid var(--line)', borderRadius: 2, padding: 16, marginBottom: 10, background: 'var(--surface)' }}>
            <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, color: 'var(--copper)' }}>#{o.id.slice(-6)}</div>
            <div>
              {[
                ...o.items.map((i) =>
                  i.format > 0
                    ? `${i.quantity} × ${i.beer.name} ${i.format}cl${i.glass ? ` + ${i.glass.name} ${i.glass.volumeCl}cl` : ''}`
                    : `+ ${i.glass.name} ${i.glass.volumeCl}cl (${i.beer.name})`
                ),
                ...(o.extras || []).map((x) => `${x.quantity} × ${x.name}`),
              ].join(', ')}
            </div>
            <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11.5, marginTop: 6, color: 'rgba(var(--ink-rgb),0.6)' }}>
              {o.pickup ? '📍 Retrait à Bondues' : `🚚 Livraison — ${o.town}`}
              {o.deliveryFeeCents > 0 && ` (+${(o.deliveryFeeCents / 100).toFixed(2)} €)`}
            </div>
            {o.depositChargedCents > 0 && (
              <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, marginTop: 2, color: 'var(--copper)' }}>
                ♻️ Consignes : +{(o.depositChargedCents / 100).toFixed(2)} €
              </div>
            )}
            {o.depositReturnedCents > 0 && (
              <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, marginTop: 2, color: 'var(--pine)' }}>
                ♻️ Consignes reprises : −{(o.depositReturnedCents / 100).toFixed(2)} €
              </div>
            )}
            {o.discountCents > 0 && (
              <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, marginTop: 2, color: 'var(--pine)' }}>
                🏷️ Remise volume pro : −{(o.discountCents / 100).toFixed(2)} €
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 12 }}>
                {(o.totalCents / 100).toFixed(2)} € — <span style={{ color: o.status === 'LIVREE' ? 'var(--pine)' : o.status === 'ANNULEE' ? 'var(--copper)' : 'inherit' }}>{STATUS_LABELS[o.status] || o.status}</span>
              </div>
              {o.invoice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {o.invoice.dueDate && !o.invoice.paidAt && (
                    <span style={{ fontSize: 11, color: new Date(o.invoice.dueDate) < new Date() ? '#A32D2D' : 'var(--copper)', fontFamily: 'Public Sans, sans-serif' }}>
                      {new Date(o.invoice.dueDate) < new Date() ? 'En retard — échéance' : 'À régler avant le'} {new Date(o.invoice.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {o.invoice.paidAt && <span style={{ fontSize: 11, color: 'var(--pine)', fontFamily: 'Public Sans, sans-serif' }}>✓ Payée</span>}
                  <a href={`/api/factures/${o.invoice.id}/pdf`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--pine)' }}>
                    📄 Télécharger la facture ({o.invoice.number})
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>
    );
  }

  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 420 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setMode('login')} className="btn" style={mode !== 'login' ? { background: 'transparent', color: 'var(--pine)' } : {}}>Se connecter</button>
        <button onClick={() => setMode('signup')} className="btn" style={mode !== 'signup' ? { background: 'transparent', color: 'var(--pine)' } : {}}>Créer un compte</button>
      </div>

      {error && <p style={{ color: '#A32D2D', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {mode === 'login' ? (
        <form onSubmit={handleLogin}>
          <div className="field"><label>Email</label><input type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Mot de passe</label><input type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Se connecter</button>
        </form>
      ) : (
        <form onSubmit={handleSignup}>
          <div className="field"><label>Nom</label><input required onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Mot de passe</label><input type="password" required minLength={8} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
          <div className="field">
            <label>Commune</label>
            <select onChange={(e) => setForm({ ...form, town: e.target.value })}>
              {TOWN_NAMES.map((t) => <option key={t} value={t}>{townLabel(t)}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Type de compte</label>
            <select onChange={(e) => setForm({ ...form, accountType: e.target.value })}>
              <option value="particulier">Particulier</option>
              <option value="professionnel">Professionnel</option>
            </select>
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }}>Créer mon compte</button>
        </form>
      )}
    </main>
  );
}
