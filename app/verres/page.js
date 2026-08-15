import GlassIllustration from '../components/GlassIllustration';

export const metadata = { title: 'Histoire des verres à bière — Houblon chez toi' };

const GLASS_TYPES = [
  {
    name: 'Le galopin',
    volumeCl: 12.5,
    text: "Le plus petit format traditionnel, très présent dans le Nord de la France. On le commande pour goûter vite, entre deux tournées, sans s'engager sur un verre complet.",
  },
  {
    name: 'Le demi',
    volumeCl: 25,
    text: "Le format le plus servi dans les cafés français, malgré son nom : un « demi » ne fait pas un demi-litre, mais 25 cl. L'origine viendrait d'un demi-litre partagé à deux au XIXe siècle.",
  },
  {
    name: 'Le verre à bière (33 cl)',
    volumeCl: 33,
    text: "Le format bouteille standard, celui de la plupart de nos bières artisanales. Souvent servi dans un verre calice ou tulipe qui concentre les arômes.",
  },
  {
    name: 'La chope',
    volumeCl: 50,
    text: "Verre à anse, pensé pour les bières de soif qu'on boit franchement. Un classique des brasseries et des grandes tablées.",
  },
  {
    name: 'La grande bouteille (75 cl)',
    volumeCl: 75,
    text: 'Format à partager, souvent réservé aux trappistes, triples et bières de garde — celles que l\'on prend le temps de déguster à plusieurs.',
  },
  {
    name: 'Le magnum',
    volumeCl: 150,
    text: "L'équivalent de deux bouteilles classiques. Un format qui se réserve pour les grandes occasions ou les tablées généreuses.",
  },
  {
    name: 'Le jéroboam',
    volumeCl: 300,
    text: "Emprunté au monde du vin (4 bouteilles), ce format spectaculaire de 3 litres se voit surtout chez les brasseurs qui soignent les grands événements.",
  },
  {
    name: 'Le mathusalem',
    volumeCl: 600,
    text: "Un très grand format de 6 litres, l'équivalent de 8 bouteilles. Rarissime en bière, il reste un symbole de fête et de partage à grande échelle.",
  },
];

export default function VerresPage() {
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 780 }}>
      <h1 style={{ color: 'var(--pine)' }}>Histoire des verres à bière</h1>
      <p style={{ color: 'rgba(var(--ink-rgb),0.75)', lineHeight: 1.7, marginBottom: 32 }}>
        Chez Houblon chez toi, on ne vend jamais une bière sans penser au verre qui va avec — c'est même ce qui
        nous distingue. Chaque format a son histoire et son usage. Voici un petit tour d'horizon, du galopin
        au mathusalem.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {GLASS_TYPES.map((g) => (
          <div
            key={g.name}
            style={{
              display: 'flex', gap: 20, alignItems: 'center', background: 'var(--paper-warm)',
              border: '1px solid var(--line)', borderRadius: 6, padding: 20,
            }}
          >
            <div style={{ flexShrink: 0, width: 70, display: 'flex', justifyContent: 'center' }}>
              <GlassIllustration volumeCl={g.volumeCl} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontSize: 18, color: 'var(--pine)', margin: 0 }}>{g.name}</h2>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11.5, color: 'var(--copper)' }}>
                  {g.volumeCl >= 100 ? `${(g.volumeCl / 100).toFixed(1).replace('.0', '')} L` : `${g.volumeCl} cl`}
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: 'rgba(var(--ink-rgb),0.75)', lineHeight: 1.6, margin: 0 }}>{g.text}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.5)', marginTop: 32 }}>
        Selon les bières, nous proposons un ou plusieurs de ces formats à l'achat — voir chaque{' '}
        <a href="/#catalogue" style={{ color: 'var(--pine)' }}>fiche produit</a>.
      </p>
    </main>
  );
}
