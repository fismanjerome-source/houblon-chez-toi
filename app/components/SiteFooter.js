import SocialIcons from './SocialIcons';

export default function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--line)', marginTop: 60 }}>
      <div className="wrap" style={{ padding: '28px 0', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontFamily: 'Space Mono, monospace', fontSize: 11.5 }}>
          <a href="/contact" style={{ color: 'rgba(15,23,18,0.6)' }}>Contact</a>
          <a href="/cgu" style={{ color: 'rgba(15,23,18,0.6)' }}>CGU</a>
          <a href="/mentions-legales" style={{ color: 'rgba(15,23,18,0.6)' }}>Mentions légales</a>
        </div>
        <SocialIcons />
      </div>
      <div style={{ background: 'var(--pine)' }}>
        <div className="wrap" style={{ padding: '10px 0', textAlign: 'center' }}>
          <p style={{ margin: 0, fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'var(--paper)', letterSpacing: '0.02em' }}>
            L'abus d'alcool est dangereux pour la santé. À consommer avec modération. Vente interdite aux mineurs de moins de 18 ans.
          </p>
        </div>
      </div>
      <div className="wrap" style={{ padding: '14px 0', textAlign: 'center' }}>
        <p style={{ margin: 0, fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'rgba(15,23,18,0.45)' }}>
          © 2026 Houblon chez toi. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
