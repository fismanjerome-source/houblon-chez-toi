export const metadata = { title: 'Contact — Houblon chez toi' };

export default function ContactPage() {
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 560 }}>
      <h1 style={{ color: 'var(--pine)' }}>Contact</h1>
      <p style={{ color: 'rgba(var(--ink-rgb),0.75)', lineHeight: 1.7 }}>
        Une question sur une commande, une livraison, ou nos bières ? Écrivez-nous :
      </p>
      <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line)', borderRadius: 6, padding: 20, marginTop: 16 }}>
        <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, color: 'rgba(var(--ink-rgb),0.5)', marginBottom: 4 }}>EMAIL</div>
        <a href="mailto:contact@houbloncheztoi.fr" style={{ color: 'var(--pine)', fontSize: 15 }}>contact@houbloncheztoi.fr</a>
      </div>
      <p style={{ color: 'rgba(var(--ink-rgb),0.5)', fontSize: 12.5, marginTop: 20 }}>
        Adresse e-mail à titre indicatif — pensez à la remplacer par la vôtre.
      </p>
    </main>
  );
}
