export default function Logo({ size = 34 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M14 6h20l-2.4 26.5C31.2 37.7 27.9 41 24 41s-7.2-3.3-7.6-8.5L14 6z"
          fill="var(--paper)"
          stroke="var(--pine)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M16.4 16h15.2" stroke="var(--pine)" strokeWidth="1.5" opacity="0.35" />
        <path
          d="M15.3 14c-3 0-5 2.6-4.3 5.6.6 2.6 3 4.1 5.4 3.4"
          stroke="var(--amber)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <ellipse cx="24" cy="7.5" rx="10.5" ry="3" fill="var(--amber)" opacity="0.9" />
        <circle cx="20" cy="6.5" r="1.1" fill="var(--paper)" />
        <circle cx="26.5" cy="5.8" r="0.9" fill="var(--paper)" />
        <circle cx="23" cy="7.8" r="0.7" fill="var(--paper)" />
      </svg>
      <span style={{ fontFamily: 'Fraunces, serif', fontSize: size * 0.5, color: 'var(--pine)', fontWeight: 600, letterSpacing: '-0.01em' }}>
        Houblon chez toi
      </span>
    </span>
  );
}
