const { TOWN_NAMES } = require('../../lib/towns');
const { getLocale } = require('../../lib/i18n');

export const metadata = { title: 'FAQ — Houblon chez toi' };

const townsListFr = `${TOWN_NAMES.slice(0, -1).join(', ')} et ${TOWN_NAMES[TOWN_NAMES.length - 1]}`;
const townsListNl = `${TOWN_NAMES.slice(0, -1).join(', ')} en ${TOWN_NAMES[TOWN_NAMES.length - 1]}`;

const FAQS = {
  fr: [
    {
      q: 'Dans quelles communes livrez-vous ?',
      a: `Nous livrons à ${townsListFr}. Vous pouvez aussi choisir le retrait sur place à Bondues.`,
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
  ],
  nl: [
    {
      q: 'Naar welke gemeenten leveren jullie?',
      a: `Wij leveren aan ${townsListNl}. U kunt ook kiezen om zelf af te halen in Bondues.`,
    },
    {
      q: 'Wat zijn de levertijden en -momenten?',
      a: 'Wij leveren van maandag tot vrijdag van 18u tot 19u30, en op zaterdag van 10u tot 12u (geen levering op zondag). Een bestelling geplaatst vóór 15u kan, afhankelijk van de beschikbaarheid, nog dezelfde dag geleverd worden. Na 15u geplaatst, wordt ze vanaf de volgende dag geleverd. Bestellingen op zondag worden vanaf maandag verwerkt.',
    },
    {
      q: 'Is de levering betalend?',
      a: 'De levering is gratis in Bondues, en gratis overal elders in onze regio vanaf 49 € aankoop. Daaronder wordt 4,90 € leveringskosten aangerekend. Zelf afhalen in Bondues is altijd gratis.',
    },
    {
      q: 'Hoe kan ik mijn bestelling betalen?',
      a: 'Online betalen met bankkaart komt binnenkort beschikbaar. In afwachting daarvan gebeurt de betaling contant, rechtstreeks bij levering of afhaling.',
    },
    {
      q: 'Wat is het statiegeld op sommige flessen?',
      a: 'Sommige Belgische bieren worden verkocht met statiegeld (doorgaans 0,10 €, 0,50 € voor de Paix Dieu), vermeld op de productfiche. Breng uw lege flessen terug bij een volgende bestelling: het bedrag wordt automatisch verrekend via de rubriek "Statiegeldflessen inleveren".',
    },
    {
      q: 'Kan ik mijn bestelling zelf komen afhalen?',
      a: 'Ja, afhalen in Bondues (984 Avenue du Général de Gaulle) wordt bij de bestelling voorgesteld, op dezelfde momenten als de levering.',
    },
    {
      q: 'Hoe kunnen jullie contacteren?',
      a: 'Per telefoon of sms op 06 08 12 91 45, via WhatsApp, of per e-mail naar contact@houbloncheztoi.fr. Wij antwoorden snel, meestal dezelfde dag nog.',
    },
  ],
};

const TXT = {
  fr: {
    title: 'Questions fréquentes',
    intro: 'Les réponses aux questions qu’on nous pose le plus souvent. Une autre question ? Écrivez-nous, voir notre page',
    contact: 'Contact',
  },
  nl: {
    title: 'Veelgestelde vragen',
    intro: 'De antwoorden op de vragen die we het vaakst krijgen. Nog een vraag? Schrijf ons, zie onze pagina',
    contact: 'Contact',
  },
};

export default function FaqPage() {
  const locale = getLocale();
  const t = TXT[locale] || TXT.fr;
  const faqs = FAQS[locale] || FAQS.fr;
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>{t.title}</h1>
      <p style={{ color: 'rgba(var(--ink-rgb),0.7)', marginBottom: 8 }}>
        {t.intro} <a href="/contact" style={{ color: 'var(--pine)' }}>{t.contact}</a>.
      </p>

      {faqs.map((item, i) => (
        <section key={i} style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 17, color: 'var(--pine)', marginBottom: 6 }}>{item.q}</h2>
          <p style={{ color: 'rgba(var(--ink-rgb),0.75)', lineHeight: 1.7, fontSize: 14.5 }}>{item.a}</p>
        </section>
      ))}
    </main>
  );
}
