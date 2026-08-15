export default function ReviewStars({ rating }) {
  return (
    <span style={{ color: 'var(--amber)', fontSize: 16, letterSpacing: 2 }}>
      {'★'.repeat(rating)}
      <span style={{ color: 'rgba(var(--ink-rgb),0.2)' }}>{'★'.repeat(5 - rating)}</span>
    </span>
  );
}
