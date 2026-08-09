'use client';
import { useState, useEffect } from 'react';

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

  async function handleSignup(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setUser(data);
    loadOrders();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: form.email, password: form.password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setUser(data);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ color: 'var(--pine)' }}>Bonjour {user.name?.split(' ')[0] || ''}</h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span onClick={() => setShowPasswordForm((v) => !v)} style={{ cursor: 'pointer', fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--pine)' }}>
              {showPasswordForm ? 'Fermer' : 'Changer le mot de passe'}
            </span>
            <span onClick={handleLogout} style={{ cursor: 'pointer', fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--copper)' }}>Se déconnecter</span>
          </div>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} style={{ background: 'var(--paper-warm)', border: '1px solid var(--line)', padding: 20, marginBottom: 30, maxWidth: 380 }}>
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
        {orders.length === 0 && <p style={{ color: 'rgba(15,23,18,0.5)' }}>Aucune commande pour le moment.</p>}
        {orders.map((o) => (
          <div key={o.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: 16, marginBottom: 10, background: 'white' }}>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--copper)' }}>#{o.id.slice(-6)}</div>
            <div>{o.items.map((i) => `${i.quantity} × ${i.beer.name} ${i.format}cl`).join(', ')}</div>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, marginTop: 6 }}>
              {(o.totalCents / 100).toFixed(2)} € — {o.status}
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
              {['Bondues', 'Linselles', 'Mouvaux', 'Bousbecques', 'Marcq-en-Barœul', 'Wasquehal', 'Roncq', 'Comines'].map((t) => <option key={t}>{t}</option>)}
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
