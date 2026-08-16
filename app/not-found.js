const { getLocale } = require('../lib/i18n');
import HopIcon from './components/HopIcon';

const TXT = {
  fr: {
    title: 'Page introuvable',
    body: "Cette page n'existe pas ou plus, mais nos bières sont toujours là.",
    cta: 'Retour à la boutique',
  },
  nl: {
    title: 'Pagina niet gevonden',
    body: 'Deze pagina bestaat niet (meer), maar onze bieren staan nog steeds klaar.',
    cta: 'Terug naar de winkel',
  },
};

export default function NotFound() {
  const locale = getLocale();
  const t = TXT[locale] || TXT.fr;
  return (
    <main className="wrap" style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <HopIcon size={56} />
      </div>
      <h1 style={{ color: 'var(--pine)', marginBottom: 8 }}>404 — {t.title}</h1>
      <p style={{ color: 'rgba(var(--ink-rgb),0.65)', marginBottom: 28, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
        {t.body}
      </p>
      <a href="/" className="btn">{t.cta}</a>
    </main>
  );
}
