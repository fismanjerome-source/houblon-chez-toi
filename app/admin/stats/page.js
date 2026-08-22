import { cookies } from 'next/headers';
const { prisma } = require('../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
import AdminNav from '../../components/AdminNav';

export const dynamic = 'force-dynamic';

function euros(cents) {
  return `${(cents / 100).toFixed(2)} €`;
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 2, padding: '16px 18px' }}>
      <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(var(--ink-rgb),0.55)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: 'var(--pine)' }}>{value}</div>
    </div>
  );
}

export default async function AdminStatsPage() {
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

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    ordersAllTime,
    revenueAllTime,
    customersAllTime,
    orders30d,
    revenue30d,
    newCustomers30d,
    reviewStats,
    referralsTotal,
    referralsCompleted,
    creditDistributed,
    recentOrders,
    topBeersRaw,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalCents: true } }),
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { isAdmin: false, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true, where: { published: true } }),
    prisma.referral.count(),
    prisma.referral.count({ where: { status: 'COMPLETED' } }),
    prisma.referral.aggregate({ _sum: { rewardCents: true }, where: { status: 'COMPLETED' } }),
    prisma.order.findMany({ where: { createdAt: { gte: fourteenDaysAgo } }, select: { createdAt: true, totalCents: true } }),
    prisma.orderItem.groupBy({ by: ['beerId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
  ]);

  const topBeerIds = topBeersRaw.map((r) => r.beerId);
  const topBeersInfo = await prisma.beer.findMany({ where: { id: { in: topBeerIds } } });
  const topBeers = topBeersRaw.map((r) => ({
    beer: topBeersInfo.find((b) => b.id === r.beerId),
    quantity: r._sum.quantity,
  }));

  const avgBasket30d = orders30d > 0 ? Math.round((revenue30d._sum.totalCents || 0) / orders30d) : 0;

  const dailyMap = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = { count: 0, cents: 0 };
  }
  for (const o of recentOrders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (dailyMap[key]) {
      dailyMap[key].count += 1;
      dailyMap[key].cents += o.totalCents;
    }
  }
  const dailyEntries = Object.entries(dailyMap).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const maxDailyCount = Math.max(1, ...dailyEntries.map(([, v]) => v.count));

  return (
    <main className="wrap" style={{ padding: '48px 0' }}>
      <h1 style={{ color: 'var(--pine)', marginBottom: 8 }}>Administration</h1>
      <AdminNav active="/admin/stats" />

      <h2 style={{ color: 'var(--pine)', marginBottom: 4 }}>Statistiques</h2>
      <p style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.55)', marginBottom: 20 }}>
        Le trafic brut (visiteurs, pages vues) est visible dans l'onglet <strong>Analytics</strong> de ton projet sur vercel.com — cette page couvre l'activité commerciale, calculée depuis les commandes.
      </p>

      <h3 style={{ fontSize: 14, color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>30 derniers jours</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Commandes" value={orders30d} />
        <StatCard label="Chiffre d'affaires" value={euros(revenue30d._sum.totalCents || 0)} />
        <StatCard label="Nouveaux clients" value={newCustomers30d} />
        <StatCard label="Panier moyen" value={euros(avgBasket30d)} />
      </div>

      <h3 style={{ fontSize: 14, color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Depuis le début</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        <StatCard label="Commandes totales" value={ordersAllTime} />
        <StatCard label="Chiffre d'affaires total" value={euros(revenueAllTime._sum.totalCents || 0)} />
        <StatCard label="Clients inscrits" value={customersAllTime} />
        <StatCard label="Note moyenne avis" value={reviewStats._count > 0 ? `${reviewStats._avg.rating.toFixed(1)} ★ (${reviewStats._count})` : '—'} />
        <StatCard label="Parrainages menés à terme" value={`${referralsCompleted} / ${referralsTotal}`} />
        <StatCard label="Crédit parrainage distribué" value={euros(creditDistributed._sum.rewardCents || 0)} />
      </div>

      <h3 style={{ fontSize: 14, color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Commandes par jour (14 derniers jours)</h3>
      <div style={{ background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 2, padding: '16px 18px', marginBottom: 28 }}>
        {dailyEntries.map(([date, v]) => (
          <div key={date} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, fontSize: 12.5 }}>
            <div style={{ fontFamily: 'Public Sans, sans-serif', width: 80, color: 'rgba(var(--ink-rgb),0.6)', flexShrink: 0 }}>
              {new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
            </div>
            <div style={{ flex: 1, background: 'var(--paper-warm)', borderRadius: 3, height: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: `${(v.count / maxDailyCount) * 100}%`, background: 'var(--amber)', height: '100%', borderRadius: 3 }} />
            </div>
            <div style={{ fontFamily: 'Public Sans, sans-serif', width: 96, textAlign: 'right', flexShrink: 0 }}>
              {v.count} · {euros(v.cents)}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: 14, color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>Bières les plus vendues</h3>
      <div style={{ background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 2, padding: '16px 18px' }}>
        {topBeers.length === 0 && <p style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.55)', margin: 0 }}>Aucune vente pour le moment.</p>}
        {topBeers.map(({ beer, quantity }, i) => (
          <div key={beer?.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < topBeers.length - 1 ? '2px solid var(--line)' : 'none', fontSize: 13.5 }}>
            <span>{i + 1}. {beer?.name || 'Bière supprimée'}</span>
            <span style={{ fontFamily: 'Public Sans, sans-serif', color: 'var(--copper)' }}>{quantity} vendues</span>
          </div>
        ))}
      </div>
    </main>
  );
}
