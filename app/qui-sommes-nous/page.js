const { getLocale } = require('../../lib/i18n');

export const metadata = { title: 'Qui sommes-nous — Houblon chez toi' };

const PROMESSES = {
  fr: [
    {
      title: 'Familial',
      text: "Houblon chez toi est une affaire de famille, portée depuis Bondues. On y met le même soin qu'on aimerait qu'on mette pour nous — et notre rêve, à terme, c'est de transmettre tout ce qu'on a appris sur la bière à nos enfants.",
    },
    {
      title: 'Sérieux',
      text: "Chaque bière du catalogue a été goûtée avant d'être vendue. Les fiches produits (robe, nez, bouche, accords) sont rédigées à partir des informations réelles des brasseries, pas de textes génériques copiés-collés.",
    },
    {
      title: 'Disponible',
      text: "Une question, une envie particulière, un souci sur une commande ? On répond en direct, par téléphone, SMS ou WhatsApp — pas de formulaire perdu dans un service client anonyme.",
    },
    {
      title: 'Professionnel',
      text: "Créneaux de livraison fixes et respectés, consignes suivies et recréditées correctement, commandes confirmées par email : on essaie de faire les choses proprement, comme on aimerait qu'on nous les fasse.",
    },
    {
      title: 'Transparent',
      text: "Les prix, les consignes et les frais de livraison sont annoncés clairement avant validation, sans surprise à la fin. Les avis clients publiés sur le site sont ceux qu'on reçoit, tels quels.",
    },
  ],
  nl: [
    {
      title: 'Familiaal',
      text: 'Houblon chez toi is een familiezaak, gerund vanuit Bondues. We besteden er dezelfde zorg aan als we voor onszelf zouden willen — en onze droom is uiteindelijk om alles wat we over bier hebben geleerd door te geven aan onze kinderen.',
    },
    {
      title: 'Serieus',
      text: 'Elk bier in ons aanbod is geproefd voordat het verkocht wordt. De productfiches (uitzicht, neus, mond, bij dit bier past) zijn geschreven op basis van echte informatie van de brouwerijen, geen generieke kopieerteksten.',
    },
    {
      title: 'Beschikbaar',
      text: 'Een vraag, een specifieke wens, een probleem met een bestelling? Wij antwoorden rechtstreeks, per telefoon, sms of WhatsApp — geen formulier dat verloren gaat in een anonieme klantendienst.',
    },
    {
      title: 'Professioneel',
      text: 'Vaste en gerespecteerde leveringsmomenten, correct opgevolgd en terugbetaald statiegeld, bestellingen bevestigd per e-mail: we proberen alles netjes te doen, zoals we het zelf zouden willen ontvangen.',
    },
    {
      title: 'Transparant',
      text: 'Prijzen, statiegeld en leveringskosten worden duidelijk vermeld vóór bevestiging, zonder verrassingen achteraf. De klantenbeoordelingen op de site zijn precies zoals we ze ontvangen.',
    },
  ],
};

const TXT = {
  fr: {
    title: 'Qui sommes-nous',
    photoSoon: 'Photo à venir',
    intro: "Houblon chez toi n'est pas né d'un plan d'affaires, mais d'une passion sincère pour les bières du Nord et de Belgique — leurs brasseurs, leurs histoires, leurs saveurs. C'est une petite affaire familiale, basée à Bondues, qui livre à vélo... enfin, en voiture, dans les communes autour de chez nous. On ne vend que ce qu'on a goûté et aimé, et on prend le temps de vous conseiller comme on conseillerait un proche.",
    beforeOrder: 'Une question avant de commander ? Voir notre',
    faq: 'FAQ',
    or: 'ou',
    contactUs: 'contactez-nous directement',
  },
  nl: {
    title: 'Over ons',
    photoSoon: 'Foto binnenkort',
    intro: 'Houblon chez toi is niet ontstaan uit een businessplan, maar uit een oprechte passie voor de bieren van Noord-Frankrijk en België — hun brouwers, hun verhalen, hun smaken. Het is een kleine familiezaak, gevestigd in Bondues, die levert per fiets... nou ja, met de auto, in de gemeenten rond ons. Wij verkopen alleen wat we zelf geproefd en goedgekeurd hebben, en we nemen de tijd om u te adviseren zoals we een naaste zouden adviseren.',
    beforeOrder: 'Een vraag voor u bestelt? Bekijk onze',
    faq: 'FAQ',
    or: 'of',
    contactUs: 'neem rechtstreeks contact met ons op',
  },
};

export default function QuiSommesNousPage() {
  const locale = getLocale();
  const t = TXT[locale] || TXT.fr;
  const promesses = PROMESSES[locale] || PROMESSES.fr;
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>{t.title}</h1>

      <div
        style={{
          background: 'var(--paper-warm)',
          border: '1px dashed var(--line)',
          borderRadius: 3,
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0',
          color: 'rgba(var(--ink-rgb),0.4)',
          fontSize: 13,
          fontFamily: 'Public Sans, sans-serif',
        }}
      >
        {t.photoSoon}
      </div>

      <p style={{ color: 'rgba(var(--ink-rgb),0.8)', lineHeight: 1.75, fontSize: 15 }}>
        {t.intro}
      </p>

      {promesses.map((p) => (
        <section key={p.title} style={{ marginTop: 26 }}>
          <h2 style={{ fontSize: 17, color: 'var(--pine)', marginBottom: 6 }}>{p.title}</h2>
          <p style={{ color: 'rgba(var(--ink-rgb),0.75)', lineHeight: 1.7, fontSize: 14.5 }}>{p.text}</p>
        </section>
      ))}

      <p style={{ marginTop: 32, color: 'rgba(var(--ink-rgb),0.7)', fontSize: 14.5 }}>
        {t.beforeOrder} <a href="/faq" style={{ color: 'var(--pine)' }}>{t.faq}</a>{' '}
        {t.or} <a href="/contact" style={{ color: 'var(--pine)' }}>{t.contactUs}</a>.
      </p>
    </main>
  );
}
