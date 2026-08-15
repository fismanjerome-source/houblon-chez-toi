export default function FlagIcon({ country, size = 18 }) {
  const width = size;
  const height = Math.round(size * 0.75);

  if (country === 'BE') {
    return (
      <svg width={width} height={height} viewBox="0 0 30 24" style={{ borderRadius: 2, boxShadow: '0 0 0 1px rgba(var(--ink-rgb),0.15)' }} aria-label="Belgique">
        <rect width="10" height="24" x="0" fill="#000000" />
        <rect width="10" height="24" x="10" fill="#FDDA24" />
        <rect width="10" height="24" x="20" fill="#EF3340" />
      </svg>
    );
  }

  return (
    <svg width={width} height={height} viewBox="0 0 30 24" style={{ borderRadius: 2, boxShadow: '0 0 0 1px rgba(var(--ink-rgb),0.15)' }} aria-label="France">
      <rect width="10" height="24" x="0" fill="#0055A4" />
      <rect width="10" height="24" x="10" fill="#FFFFFF" />
      <rect width="10" height="24" x="20" fill="#EF4135" />
    </svg>
  );
}
