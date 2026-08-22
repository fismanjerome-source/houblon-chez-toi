const TXT = {
  fr: {
    label: 'NOS VALEURS',
    title: "Une passion qu'on veut transmettre",
    body: "Houblon chez toi n'est pas né d'un plan d'affaires, mais d'une passion sincère pour les bières du Nord et de Belgique — leurs brasseurs, leurs histoires, leurs saveurs. On ne vend que ce qu'on a goûté et aimé, on prend le temps de bien vous conseiller, et on croit à une consommation qui se savoure plutôt qu'elle ne se consomme. Notre rêve, à terme, c'est simple : transmettre tout ce qu'on a appris sur la bière à nos enfants, comme d'autres transmettent un métier ou un jardin.",
  },
  nl: {
    label: 'ONZE WAARDEN',
    title: 'Een passie die we willen doorgeven',
    body: "Houblon chez toi is niet ontstaan uit een businessplan, maar uit een oprechte passie voor de bieren van Noord-Frankrijk en België — hun brouwers, hun verhalen, hun smaken. Wij verkopen alleen wat we zelf geproefd en goedgekeurd hebben, we nemen de tijd om u goed te adviseren, en we geloven in een manier van consumeren die geniet in plaats van verbruikt. Onze droom is uiteindelijk heel eenvoudig: alles wat we over bier hebben geleerd doorgeven aan onze kinderen, zoals anderen een vak of een tuin doorgeven.",
  },
};

export default function OurValues({ locale = 'fr' }) {
  const t = TXT[locale] || TXT.fr;
  return (
    <section className="wrap" style={{ padding: '8px 0 40px' }}>
      <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line)', borderRadius: 6, padding: '28px 24px', maxWidth: 680 }}>
        <div style={{ fontFamily: 'Public Sans, sans-serif', fontSize: 11, letterSpacing: '0.08em', color: 'var(--copper)', marginBottom: 8 }}>
          {t.label}
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 21, color: 'var(--pine)', margin: '0 0 10px' }}>
          {t.title}
        </h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(var(--ink-rgb),0.8)', margin: 0 }}>
          {t.body}
        </p>
      </div>
    </section>
  );
}
