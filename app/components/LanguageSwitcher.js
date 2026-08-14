'use client';

function setLocale(locale) {
  document.cookie = `hct_locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.location.reload();
}

export default function LanguageSwitcher({ locale }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <button
        type="button"
        onClick={() => setLocale('fr')}
        aria-label="Français"
        title="Français"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 2,
          opacity: locale === 'fr' ? 1 : 0.4, lineHeight: 1,
        }}
      >
        🇫🇷
      </button>
      <button
        type="button"
        onClick={() => setLocale('nl')}
        aria-label="Nederlands"
        title="Nederlands"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 2,
          opacity: locale === 'nl' ? 1 : 0.4, lineHeight: 1,
        }}
      >
        🇧🇪
      </button>
    </div>
  );
}
