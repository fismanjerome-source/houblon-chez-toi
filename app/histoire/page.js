import HopFieldIllustration from '../components/HopFieldIllustration';

export const metadata = { title: 'Histoire de la bière — Houblon chez toi' };

export default function HistoirePage() {
  return (
    <main className="wrap" style={{ padding: '48px 0', maxWidth: 720 }}>
      <h1 style={{ color: 'var(--pine)' }}>Le Nord et la Belgique, terres de bière</h1>

      <p style={{ color: 'rgba(15,23,18,0.8)', lineHeight: 1.8, fontSize: 15, marginTop: 20 }}>
        Entre le Nord de la France et la Belgique s'étend l'une des régions brassicoles les plus riches
        d'Europe. Ici, la bière n'est pas un produit comme un autre : c'est une culture, transmise de
        brasserie familiale en brasserie familiale, parfois depuis plus d'un siècle. Les moines cisterciens
        et trappistes ont posé les bases dès le Moyen Âge, affinant des recettes d'abbaye toujours brassées
        aujourd'hui. Autour d'eux, des brasseries indépendantes ont grandi au fil des générations, chacune
        avec sa levure maison, son savoir-faire et son terroir — les houblons de Flandre, l'eau des Monts
        de Flandre, les malts du Nord.
      </p>

      <div style={{ borderRadius: 8, overflow: 'hidden', margin: '28px 0' }}>
        <HopFieldIllustration />
      </div>

      <h2 style={{ fontSize: 19, color: 'var(--pine)', marginBottom: 8 }}>Un vrai savoir-faire</h2>
      <p style={{ color: 'rgba(15,23,18,0.8)', lineHeight: 1.8, fontSize: 15 }}>
        Tout commence dans les champs : le houblon grimpe le long de fils tendus à 6-7 mètres de haut,
        récolté une fois par an à la fin de l'été, quand ses cônes sont gorgés d'huiles aromatiques et de
        résines amérisantes. Vient ensuite le maltage de l'orge, le brassage — l'art de marier l'eau, le
        malt, le houblon et la levure à la bonne température, au bon moment — puis la fermentation, qui
        peut durer de quelques jours à plusieurs mois selon le style. Chaque brasseur ajuste ses recettes
        au fil des saisons et des récoltes : rien n'est jamais tout à fait automatique. C'est ce savoir-faire,
        patient et précis, qu'on veut vous faire goûter à chaque bouteille.
      </p>

      <p style={{ color: 'rgba(15,23,18,0.8)', lineHeight: 1.8, fontSize: 15 }}>
        C'est cette diversité qu'on veut vous faire découvrir : des triples d'abbaye puissantes aux
        blondes légères de comptoir, en passant par les IPA modernes qui réinventent le style avec des
        houblons venus d'ailleurs. Chaque bière raconte un lieu, une brasserie, une manière de faire.
      </p>

      <div style={{ background: 'var(--pine)', color: 'var(--paper)', borderRadius: 6, padding: '28px 24px', margin: '32px 0' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, margin: '0 0 10px' }}>Notre sélection, pas un catalogue</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.92, margin: 0 }}>
          Le but de Houblon chez toi n'est pas de vous proposer toutes les bières du Nord et de Belgique —
          il y en a des centaines. Nous ne mettons en ligne que celles que nous avons goûtées, et que nous
          aimons vraiment. Chaque fiche produit porte notre avis, sincère et sans filtre. Si une bière n'est
          pas sur le site, c'est simplement qu'elle n'a pas encore fait notre sélection.
        </p>
      </div>

      <p style={{ color: 'rgba(15,23,18,0.8)', lineHeight: 1.8, fontSize: 15 }}>
        Prenez le temps de lire les histoires de chaque brasserie, de repérer d'où vient votre bière sur{' '}
        <a href="/#catalogue" style={{ color: 'var(--pine)' }}>notre carte</a>, et surtout : dégustez-la
        dans le bon verre. On vous en parle plus en détail dans notre page sur{' '}
        <a href="/verres" style={{ color: 'var(--pine)' }}>l'histoire des verres à bière</a>.
      </p>

      <p style={{ fontSize: 13, color: 'rgba(15,23,18,0.5)', marginTop: 28 }}>
        L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
      </p>
    </main>
  );
}
