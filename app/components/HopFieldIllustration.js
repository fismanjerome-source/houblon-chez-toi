export default function HopFieldIllustration() {
  return (
    <svg viewBox="0 0 800 320" style={{ width: '100%', height: 'auto', display: 'block' }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Champ de houblon sous un ciel dégagé">
      <rect width="800" height="320" fill="var(--paper-warm)" />
      {/* ciel */}
      <rect width="800" height="170" fill="#DCE9E0" />
      <circle cx="670" cy="60" r="34" fill="var(--amber)" opacity="0.85" />

      {/* collines lointaines */}
      <path d="M0 170 C120 145, 260 150, 400 168 C540 186, 680 150, 800 165 L800 200 L0 200 Z" fill="#B9CDBB" />

      {/* rangées de houblon : poteaux + fils + lianes */}
      {[80, 220, 360, 500, 640].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="80" x2={x} y2="300" stroke="var(--pine)" strokeWidth="6" />
          <line x1={x - 70} y1="70" x2={x + 70} y2="70" stroke="var(--pine)" strokeWidth="3" opacity="0.5" />
          {[-50, -25, 0, 25, 50].map((dx) => (
            <path
              key={dx}
              d={`M${x + dx} 300 C${x + dx * 0.6} 220, ${x + dx * 0.3} 140, ${x} 78`}
              stroke="#4a7c3f"
              strokeWidth="3"
              fill="none"
              opacity="0.85"
            />
          ))}
          {/* cônes de houblon */}
          {[120, 165, 205, 245].map((y, j) => (
            <ellipse key={j} cx={x + (j % 2 === 0 ? -18 : 20)} cy={y} rx="10" ry="14" fill="var(--amber)" opacity="0.9" />
          ))}
        </g>
      ))}

      <rect y="290" width="800" height="30" fill="var(--paper-warm)" />
    </svg>
  );
}
