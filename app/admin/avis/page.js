import { cookies } from 'next/headers';
const { prisma } = require('../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
import AdminNav from '../../components/AdminNav';
import AdminReviewList from '../../components/AdminReviewList';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
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

  const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="wrap" style={{ padding: '48px 0' }}>
      <h1 style={{ color: 'var(--pine)', marginBottom: 8 }}>Administration</h1>
      <AdminNav active="/admin/avis" />

      <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>Avis clients</h2>
      <AdminReviewList reviews={reviews} />
    </main>
  );
}
