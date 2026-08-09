export default function GlassIllustration({ volumeCl, color = 'var(--amber)' }) {
  const height = Math.round(30 + Math.log2(volumeCl + 1) * 16);
  const width = Math.round(height * 0.55);

  return (
    <svg width={width} height={height + 10} viewBox={`0 0 ${width} ${height + 10}`} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d={`M4 4 H${width - 4} L${width - 8} ${height} C${width - 8} ${height + 4} ${width - 12} ${height + 6} ${width / 2} ${height + 6} C12 ${height + 6} 8 ${height + 4} 8 ${height} Z`}
        fill="rgba(243,236,216,0.4)"
        stroke="var(--pine)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d={`M9 ${height * 0.32} H${width - 9} L${width - 8.4} ${height} C${width - 8.4} ${height + 3.5} ${width - 12} ${height + 5} ${width / 2} ${height + 5} C13 ${height + 5} 8.4 ${height + 3.5} 8.4 ${height} Z`}
        fill={color}
        opacity="0.85"
      />
    </svg>
  );
}
