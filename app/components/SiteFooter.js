import SocialIcons from './SocialIcons';

const TXT = {
  fr: {
    quiSommesNous: 'Qui sommes-nous', histoire: 'Histoire de la bière', verres: 'Histoire des verres',
    avis: 'Avis clients', faq: 'FAQ', contact: 'Contact', cgu: 'CGU', mentions: 'Mentions légales',
    warning: "L'abus d'alcool est dangereux pour la santé. À consommer avec modération. Vente interdite aux mineurs de moins de 18 ans.",
    rights: '© 2026 Houblon chez toi. Tous droits réservés.',
  },
  nl: {
    quiSommesNous: 'Over ons', histoire: 'Geschiedenis van het bier', verres: 'Geschiedenis van het bierglas',
    avis: 'Klantenbeoordelingen', faq: 'Veelgestelde vragen', contact: 'Contact', cgu: 'Algemene voorwaarden', mentions: 'Wettelijke vermeldingen',
    warning: 'Overmatig alcoholgebruik is gevaarlijk voor de gezondheid. Met mate consumeren. Verkoop verboden aan minderjarigen onder de 18 jaar.',
    rights: '© 2026 Houblon chez toi. Alle rechten voorbehouden.',
  },
};

export default function SiteFooter({ locale = 'fr' }) {
  const t = TXT[locale] || TXT.fr;
  return (
    <footer style={{ borderTop: '1px solid var(--line)', marginTop: 60 }}>
      <div className="wrap" style={{ padding: '28px 0', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontFamily: 'Space Mono, monospace', fontSize: 11.5 }}>
          <a href="/qui-sommes-nous" style={{ color: 'rgba(var(--ink-rgb),0.6)' }}>{t.quiSommesNous}</a>
          <a href="/histoire" style={{ color: 'rgba(var(--ink-rgb),0.6)' }}>{t.histoire}</a>
          <a href="/verres" style={{ color: 'rgba(var(--ink-rgb),0.6)' }}>{t.verres}</a>
          <a href="/avis" style={{ color: 'rgba(var(--ink-rgb),0.6)' }}>{t.avis}</a>
          <a href="/faq" style={{ color: 'rgba(var(--ink-rgb),0.6)' }}>{t.faq}</a>
          <a href="/contact" style={{ color: 'rgba(var(--ink-rgb),0.6)' }}>{t.contact}</a>
          <a href="/cgu" style={{ color: 'rgba(var(--ink-rgb),0.6)' }}>{t.cgu}</a>
          <a href="/mentions-legales" style={{ color: 'rgba(var(--ink-rgb),0.6)' }}>{t.mentions}</a>
        </div>
        <SocialIcons />
      </div>
      <div style={{ background: 'var(--pine)' }}>
        <div className="wrap" style={{ padding: '10px 0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--paper)', letterSpacing: '0.02em' }}>
            {t.warning}
          </p>
        </div>
      </div>
      <div className="wrap" style={{ padding: '14px 0', textAlign: 'center' }}>
        <p style={{ margin: 0, fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'rgba(var(--ink-rgb),0.45)' }}>
          {t.rights}
        </p>
      </div>
    </footer>
  );
}
