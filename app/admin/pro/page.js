import { cookies } from 'next/headers';
const { prisma } = require('../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
import AdminNav from '../../components/AdminNav';
import AdminProAccounts from '../../components/AdminProAccounts';
import AdminPricingTiers from '../../components/AdminPricingTiers';

export const dynamic = 'force-dynamic';

export default async function AdminProPage() {
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

  const users = await prisma.user.findMany({ where: { isAdmin: false }, orderBy: { name: 'asc' } });
  const tiers = await prisma.pricingTier.findMany({ orderBy: { minQuantity: 'asc' } });

  return (
    <main className="wrap" style={{ padding: '48px 0' }}>
      <h1 style={{ color: 'var(--pine)', marginBottom: 8 }}>Administration</h1>
      <AdminNav active="/admin/pro" />

      <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>Comptes PRO</h2>
      <AdminPricingTiers tiers={tiers} />
      <AdminProAccounts users={users} />
    </main>
  );
}
