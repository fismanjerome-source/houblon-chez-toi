export default function HopIcon({ size = 30 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* tige */}
      <path d="M15 2 C13 8, 13 12, 15 16" stroke="var(--pine)" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />

      {/* cône de houblon : écailles superposées */}
      <path d="M15 5 C8 5, 4 11, 4 18 C4 27, 9 33, 15 35 C21 33, 26 27, 26 18 C26 11, 22 5, 15 5Z" fill="var(--amber)" opacity="0.18" />

      <path d="M15 8 C10.5 8, 7.5 12, 7.5 17.5" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M15 8 C19.5 8, 22.5 12, 22.5 17.5" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      <path d="M15 13 C11 13, 8.5 16.5, 8.5 21" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M15 13 C19 13, 21.5 16.5, 21.5 21" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      <path d="M15 18 C12 18, 10 20.8, 10 24.3" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M15 18 C18 18, 20 20.8, 20 24.3" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      <path d="M15 23 C13 23, 11.5 25, 11.8 27.5" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M15 23 C17 23, 18.5 25, 18.2 27.5" stroke="var(--amber)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      <path d="M15 5 C8 5, 4 11, 4 18 C4 27, 9 33, 15 35 C21 33, 26 27, 26 18 C26 11, 22 5, 15 5Z" stroke="var(--pine)" strokeWidth="1.3" fill="none" />
    </svg>
  );
}
