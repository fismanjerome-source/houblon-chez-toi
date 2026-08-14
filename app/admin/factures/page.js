import { cookies } from 'next/headers';
const { prisma } = require('../../../lib/db');
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
import AdminNav from '../../components/AdminNav';

export const dynamic = 'force-dynamic';

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return `${MOIS[month - 1]} ${year}`;
}

export default async function AdminFacturesPage() {
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

  const invoices = await prisma.invoice.findMany({
    include: { order: { include: { user: true } } },
    orderBy: { issuedAt: 'desc' },
  });

  const groups = new Map();
  for (const inv of invoices) {
    const key = monthKey(inv.issuedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(inv);
  }

  return (
    <main className="wrap" style={{ padding: '48px 0' }}>
      <h1 style={{ color: 'var(--pine)', marginBottom: 8 }}>Administration</h1>
      <AdminNav active="/admin/factures" />

      <h2 style={{ color: 'var(--pine)', marginBottom: 16 }}>Factures ({invoices.length})</h2>

      {invoices.length === 0 && <p style={{ color: 'rgba(15,23,18,0.6)' }}>Aucune facture pour le moment — une facture est créée automatiquement quand une commande passe au statut « Livrée ».</p>}

      {[...groups.entries()].map(([key, group]) => {
        const monthTotal = group.reduce((sum, inv) => sum + inv.totalCents, 0);
        return (
          <div key={key} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--line)', paddingBottom: 6, marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: 'var(--pine)', textTransform: 'capitalize' }}>{monthLabel(key)}</h3>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12.5, color: 'var(--copper)' }}>
                {group.length} facture{group.length > 1 ? 's' : ''} — {(monthTotal / 100).toFixed(2)} €
              </span>
            </div>
            {group.map((inv) => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 12.5 }}>
                  <strong>{inv.number}</strong> — {inv.issuedAt.toLocaleDateString('fr-FR')} — {inv.order.user.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12.5 }}>{(inv.totalCents / 100).toFixed(2)} €</span>
                  <a href={`/api/factures/${inv.id}/pdf`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: 'var(--pine)' }}>📄 PDF</a>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </main>
  );
}
