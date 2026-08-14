const { TOWN_NAMES } = require('../../lib/towns');

export const metadata = { title: 'FAQ — Houblon chez toi' };

const FAQS = [
  {
    q: 'Dans quelles communes livrez-vous ?',
    a: `Nous livrons à ${TOWN_NAMES.slice(0, -1).join(', ')} et ${TOWN_NAMES[TOWN_NAMES.length - 1]}. Vous pouvez aussi choisir le retrait sur place à Bondues.`,
  },
  {
    q: 'Quels sont les créneaux et délais de livraison ?',
    a: 'Nous livrons du lundi au vendredi de 18h à 19h30, et le samedi de 10h à 12h (pas de livraison le dimanche). Une commande passée avant 15h peut être livrée dès le jour même, selon disponibilité. Passée après 15h, elle est livrée à partir du lendemain. Les commandes du dimanche sont traitées à partir du lundi.',
  },
  {
    q: 'La livraison est-elle payante ?',
    a: 'La livraison est gratuite à Bondues, et gratuite partout ailleurs dans notre secteur dès 49 € d’achat. En dessous, des frais de livraison de 4,90 € s’appliquent. Le retrait sur place à Bondues est toujours gratuit.',
  },
  {
    q: 'Comment puis-je payer ma commande ?',
    a: 'Le paiement en ligne par carte bancaire arrive prochainement. En attendant, le règlement se fait en espèces, directement à la livraison ou au retrait.',
  },
  {
    q: 'Qu’est-ce que la consigne sur certaines bouteilles ?',
    a: 'Certaines bières belges sont vendues avec une consigne (généralement 0,10 €, 0,50 € pour la Paix Dieu) indiquée sur la fiche produit. Rapportez vos bouteilles vides lors d’une prochaine commande : le montant est recrédité automatiquement via la rubrique « Rendre des bouteilles consignées ».',
  },
  {
    q: 'Puis-je retirer ma commande moi-même ?',
    a: 'Oui, le retrait sur place à Bondues (984 Avenue du Général de Gaulle) est proposé au moment de la commande, sur les mêmes créneaux que la livraison.',
  },
  {
    q: 'Comment vous contacter ?',
    a: 'Par téléphone ou SMS au 06 08 12 91 45, par WhatsApp, ou par email à contact@houbloncheztoi.fr. Nous répondons rapidement, en général le jour même.',
  },
];

export default function FaqPage() {
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>Questions fréquentes</h1>
      <p style={{ color: 'rgba(15,23,18,0.7)', marginBottom: 8 }}>
        Les réponses aux questions qu’on nous pose le plus souvent. Une autre question ? Écrivez-nous, voir
        notre page <a href="/contact" style={{ color: 'var(--pine)' }}>Contact</a>.
      </p>

      {FAQS.map((item, i) => (
        <section key={i} style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 17, color: 'var(--pine)', marginBottom: 6 }}>{item.q}</h2>
          <p style={{ color: 'rgba(15,23,18,0.75)', lineHeight: 1.7, fontSize: 14.5 }}>{item.a}</p>
        </section>
      ))}
    </main>
  );
}
