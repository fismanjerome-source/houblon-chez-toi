import HopIcon from './HopIcon';

export default function Logo({ size = 34 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <HopIcon size={size * 0.9} />
      <span style={{ fontFamily: 'Fraunces, serif', fontSize: size * 0.5, color: 'var(--pine)', fontWeight: 600, letterSpacing: '-0.01em' }}>
        Houblon chez toi
      </span>
    </span>
  );
}
