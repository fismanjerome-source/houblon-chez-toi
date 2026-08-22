const { prisma } = require('../../../lib/db');
import ReviewForm from '../../components/ReviewForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Donnez votre avis — Houblon chez toi' };

export default async function ReviewPage({ params }) {
  const order = await prisma.order.findUnique({ where: { reviewToken: params.token }, include: { review: true } });

  if (!order) {
    return (
      <main className="wrap" style={{ padding: '48px 0', maxWidth: 480 }}>
        <h1 style={{ color: 'var(--pine)' }}>Lien invalide</h1>
        <p>Ce lien d'avis n'existe pas ou n'est plus valide.</p>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 480 }}>
      <h1 style={{ color: 'var(--pine)', textAlign: 'center', fontSize: 22 }}>Votre avis compte pour nous</h1>
      <p style={{ textAlign: 'center', color: 'rgba(var(--ink-rgb),0.7)', fontSize: 14, marginBottom: 24 }}>
        Commande n°{order.id.slice(-6)} — {order.slot}
      </p>
      {order.review ? (
        <div style={{ background: 'var(--paper-warm)', border: '2px solid var(--line)', borderRadius: 3, padding: 24, textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--pine)' }}>Vous avez déjà laissé un avis pour cette commande, merci !</p>
        </div>
      ) : (
        <ReviewForm token={params.token} />
      )}
    </main>
  );
}
