import { cookies } from 'next/headers';
const { prisma } = require('../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
import AdminNav from '../../components/AdminNav';
import AdminPromoCodeCreator from '../../components/AdminPromoCodeCreator';
import AdminPromoCodeList from '../../components/AdminPromoCodeList';

export const dynamic = 'force-dynamic';

const STATUS_LABELS = { PENDING: 'En attente', COMPLETED: 'Crédité', CANCELLED: 'Annulé' };

export default async function AdminCodesPage() {
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

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  const referrals = await prisma.referral.findMany({
    orderBy: { createdAt: 'desc' },
    include: { referrer: true, referee: true },
  });

  return (
    <main className="wrap" style={{ padding: '48px 0' }}>
      <h1 style={{ color: 'var(--pine)', marginBottom: 8 }}>Administration</h1>
      <AdminNav active="/admin/codes" />

      <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>Codes promo & parrainage</h2>
      <AdminPromoCodeCreator />
      <AdminPromoCodeList codes={codes} />

      <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>Parrainages ({referrals.length})</h2>
      <p style={{ fontSize: 13, color: 'rgba(15,23,18,0.6)', marginTop: -10, marginBottom: 16 }}>
        Chaque client dispose automatiquement de son propre code de parrainage (visible dans son espace client).
        Le parrain est crédité de 10 € dès que la commande du filleul est marquée « Livrée ».
      </p>
      {referrals.length === 0 && <p style={{ color: 'rgba(15,23,18,0.55)' }}>Aucun parrainage pour le moment.</p>}
      {referrals.map((r) => (
        <div key={r.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: 12, marginBottom: 8, background: 'white', fontSize: 13, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <strong>{r.referrer.name}</strong> ({r.referrer.email}) a parrainé <strong>{r.referee.name}</strong> ({r.referee.email}) — code {r.code}
          </div>
          <div style={{ fontFamily: 'Space Mono, monospace', color: r.status === 'COMPLETED' ? 'var(--pine)' : 'var(--copper)' }}>
            {STATUS_LABELS[r.status] || r.status}{r.status === 'COMPLETED' ? ` (+${(r.rewardCents / 100).toFixed(2)} €)` : ''}
          </div>
        </div>
      ))}
    </main>
  );
}
