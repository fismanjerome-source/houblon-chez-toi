export const metadata = { title: 'Qui sommes-nous — Houblon chez toi' };

const PROMESSES = [
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
];

export default function QuiSommesNousPage() {
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>Qui sommes-nous</h1>

      <div
        style={{
          background: 'var(--paper-warm)',
          border: '1px dashed var(--line)',
          borderRadius: 8,
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '20px 0',
          color: 'rgba(15,23,18,0.4)',
          fontSize: 13,
          fontFamily: 'Space Mono, monospace',
        }}
      >
        Photo à venir
      </div>

      <p style={{ color: 'rgba(15,23,18,0.8)', lineHeight: 1.75, fontSize: 15 }}>
        Houblon chez toi n'est pas né d'un plan d'affaires, mais d'une passion sincère pour les bières du
        Nord et de Belgique — leurs brasseurs, leurs histoires, leurs saveurs. C'est une petite affaire
        familiale, basée à Bondues, qui livre à vélo... enfin, en voiture, dans les communes autour de chez
        nous. On ne vend que ce qu'on a goûté et aimé, et on prend le temps de vous conseiller comme on
        conseillerait un proche.
      </p>

      {PROMESSES.map((p) => (
        <section key={p.title} style={{ marginTop: 26 }}>
          <h2 style={{ fontSize: 17, color: 'var(--pine)', marginBottom: 6 }}>{p.title}</h2>
          <p style={{ color: 'rgba(15,23,18,0.75)', lineHeight: 1.7, fontSize: 14.5 }}>{p.text}</p>
        </section>
      ))}

      <p style={{ marginTop: 32, color: 'rgba(15,23,18,0.7)', fontSize: 14.5 }}>
        Une question avant de commander ? Voir notre <a href="/faq" style={{ color: 'var(--pine)' }}>FAQ</a>{' '}
        ou <a href="/contact" style={{ color: 'var(--pine)' }}>contactez-nous directement</a>.
      </p>
    </main>
  );
}
