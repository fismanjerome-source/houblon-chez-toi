import { cookies } from 'next/headers';
const { prisma } = require('../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../lib/auth');

export default async function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session || !session.isAdmin) {
    return (
      <main className="wrap" style={{ padding: '48px 0' }}>
        <h1 style={{ color: 'var(--pine)' }}>Accès réservé</h1>
        <p>Connecte-toi avec un compte administrateur pour accéder à cette page.</p>
        <a href="/compte" className="btn" style={{ marginTop: 16, display: 'inline-block' }}>Se connecter</a>
      </main>
    );
  }

  const orders = await prisma.order.findMany({
    include: { items: { include: { beer: true } }, user: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="wrap" style={{ padding: '48px 0' }}>
      <h1 style={{ color: 'var(--pine)', marginBottom: 24 }}>Toutes les commandes</h1>
      {orders.map((o) => (
        <div key={o.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: 16, marginBottom: 10, background: 'white' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--copper)' }}>
            #{o.id.slice(-6)} — {o.user.name} ({o.user.email}) — {o.user.accountType}
          </div>
          <div>{o.items.map((i) => `${i.quantity} × ${i.beer.name} ${i.format}cl`).join(', ')}</div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, marginTop: 6 }}>
            {o.pickup ? 'Retrait à Bondues' : o.town} — {o.slot} — {((o.itemsTotalCents ?? o.totalCents) / 100).toFixed(2)} €
            {o.deliveryFeeCents > 0 && ` + ${(o.deliveryFeeCents / 100).toFixed(2)} € livraison`} — {o.status}
          </div>
        </div>
      ))}
      {orders.length === 0 && <p>Aucune commande pour le moment.</p>}
    </main>
  );
}
