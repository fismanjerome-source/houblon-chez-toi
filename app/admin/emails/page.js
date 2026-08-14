import { cookies } from 'next/headers';
const { verifySessionToken, SESSION_COOKIE } = require('../../../lib/auth');
const { orderConfirmationEmail, invoiceEmail, reviewRequestEmail, SITE_URL } = require('../../../lib/emailTemplates');
import AdminNav from '../../components/AdminNav';

const SAMPLE_USER = { name: 'Camille Dupont', email: 'camille@example.com' };

const SAMPLE_ORDER = {
  id: 'sample000001exemple',
  town: 'Linselles',
  pickup: false,
  slot: 'jeudi 20 août, 18h–19h30',
  deliveryFeeCents: 0,
  depositChargedCents: 20,
  depositReturnedCents: 10,
  totalCents: 1560,
  items: [
    { format: 33, quantity: 2, unitPriceCents: 300, depositCents: 20, beer: { name: 'Chouffe' }, glass: { name: 'Verre ballon Chouffe', volumeCl: 33, price: 7.2 } },
    { format: 75, quantity: 1, unitPriceCents: 580, depositCents: 0, beer: { name: '3 Monts Blonde' }, glass: null },
  ],
  extras: [],
  reviewToken: 'sample-review-token',
};

const SAMPLE_INVOICE = { number: 'F2026-0007', issuedAt: new Date() };

export default async function AdminEmailsPage() {
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

  const confirmation = orderConfirmationEmail({ order: SAMPLE_ORDER, user: SAMPLE_USER });
  const invoice = invoiceEmail({ order: SAMPLE_ORDER, user: SAMPLE_USER, invoice: SAMPLE_INVOICE });
  const review = reviewRequestEmail({ order: SAMPLE_ORDER, user: SAMPLE_USER, reviewUrl: `${SITE_URL}/avis/sample-review-token` });

  const templates = [
    { label: 'Confirmation de commande', trigger: 'Envoyé immédiatement après validation de la commande.', ...confirmation },
    { label: 'Facture', trigger: 'Envoyé (avec le PDF en pièce jointe) quand une commande passe au statut « Livrée » en admin.', ...invoice },
    { label: "Demande d'avis", trigger: 'Programmé pour être envoyé 24h après la commande.', ...review },
  ];

  return (
    <main className="wrap" style={{ padding: '48px 0' }}>
      <h1 style={{ color: 'var(--pine)', marginBottom: 8 }}>Administration</h1>
      <AdminNav active="/admin/emails" />

      <h2 style={{ color: 'var(--pine)', marginBottom: 6 }}>Modèles de mail</h2>
      <p style={{ fontSize: 13.5, color: 'rgba(15,23,18,0.6)', marginBottom: 24 }}>
        Aperçu en lecture seule, avec des données d'exemple, tels que les emails partent réellement.
      </p>

      {templates.map((t) => (
        <div key={t.label} style={{ marginBottom: 32, border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden', background: 'white' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)' }}>
            <strong style={{ color: 'var(--pine)', fontSize: 14.5 }}>{t.label}</strong>
            <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11.5, color: 'var(--copper)', marginTop: 4 }}>Objet : {t.subject}</div>
            <div style={{ fontSize: 12, color: 'rgba(15,23,18,0.55)', marginTop: 4 }}>{t.trigger}</div>
          </div>
          <iframe title={t.label} srcDoc={t.html} style={{ width: '100%', height: 480, border: 'none', display: 'block' }} />
        </div>
      ))}
    </main>
  );
}
