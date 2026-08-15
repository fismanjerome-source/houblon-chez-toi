'use client';

function setTheme(theme) {
  document.cookie = `hct_theme=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
  window.location.reload();
}

export default function ThemeToggle({ theme }) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 17, padding: 2,
        lineHeight: 1, color: 'var(--pine)',
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
