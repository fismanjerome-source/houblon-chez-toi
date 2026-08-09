export default function SocialIcons() {
  return (
    <span style={{ display: 'inline-flex', gap: 12 }} title="Pages à venir">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-label="Facebook (bientôt disponible)">
        <circle cx="12" cy="12" r="11" stroke="var(--pine)" strokeWidth="1.4" opacity="0.45" />
        <path
          d="M13.5 8.5h1.5V6h-1.9c-1.7 0-2.6 1-2.6 2.7V10H9v2.3h1.5V18h2.3v-5.7h1.7l.3-2.3h-2V9c0-.4.2-.5.7-.5z"
          fill="var(--pine)"
          opacity="0.7"
        />
      </svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-label="Instagram (bientôt disponible)">
        <circle cx="12" cy="12" r="11" stroke="var(--pine)" strokeWidth="1.4" opacity="0.45" />
        <rect x="7" y="7" width="10" height="10" rx="3" stroke="var(--pine)" strokeWidth="1.4" opacity="0.7" />
        <circle cx="12" cy="12" r="2.5" stroke="var(--pine)" strokeWidth="1.4" opacity="0.7" />
        <circle cx="15.3" cy="8.7" r="0.7" fill="var(--pine)" opacity="0.7" />
      </svg>
    </span>
  );
}
