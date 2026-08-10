import { cookies } from 'next/headers';
const { prisma } = require('../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../lib/auth');
import AdminBasketEditor from '../components/AdminBasketEditor';
import AdminMerchEditor from '../components/AdminMerchEditor';

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
    include: { items: { include: { beer: true, glass: true } }, extras: true, user: true },
    orderBy: { createdAt: 'desc' },
  });
  const allBeers = await prisma.beer.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  const basket = await prisma.basket.findFirst({ include: { beers: true } });
  const merchProducts = await prisma.merchProduct.findMany({ orderBy: { name: 'asc' } });

  return (
    <main className="wrap" style={{ padding: '48px 0' }}>
      <h1 style={{ color: 'var(--pine)', marginBottom: 24 }}>Administration</h1>

      <AdminBasketEditor basket={basket} allBeers={allBeers} />
      <AdminMerchEditor products={merchProducts} />

      <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>Toutes les commandes</h2>
      {orders.map((o) => (
        <div key={o.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: 16, marginBottom: 10, background: 'white' }}>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--copper)' }}>
            #{o.id.slice(-6)} — {o.user.name} ({o.user.email}) — {o.user.accountType}
          </div>
          <div>
            {[
              ...o.items.map((i) =>
                i.format > 0
                  ? `${i.quantity} × ${i.beer.name} ${i.format}cl${i.glass ? ` + ${i.glass.name} ${i.glass.volumeCl}cl` : ''}`
                  : `+ ${i.glass.name} ${i.glass.volumeCl}cl (${i.beer.name})`
              ),
              ...o.extras.map((x) => `${x.quantity} × ${x.name}`),
            ].join(', ')}
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, marginTop: 6 }}>
            {o.pickup ? 'Retrait à Bondues' : o.town} — {o.slot} — {((o.itemsTotalCents ?? o.totalCents) / 100).toFixed(2)} €
            {o.deliveryFeeCents > 0 && ` + ${(o.deliveryFeeCents / 100).toFixed(2)} € livraison`}
            {o.depositChargedCents > 0 && ` + ${(o.depositChargedCents / 100).toFixed(2)} € consignes`}
            {o.depositReturnedCents > 0 && ` − ${(o.depositReturnedCents / 100).toFixed(2)} € reprise`} — {o.status}
          </div>
        </div>
      ))}
      {orders.length === 0 && <p>Aucune commande pour le moment.</p>}
    </main>
  );
}
