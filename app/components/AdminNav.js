const LINKS = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/factures', label: 'Factures' },
  { href: '/admin/pro', label: 'Comptes PRO' },
  { href: '/admin/codes', label: 'Codes & Parrainage' },
  { href: '/admin/emails', label: 'Modèles de mail' },
];

export default function AdminNav({ active }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 12,
            padding: '6px 12px',
            borderRadius: 4,
            textDecoration: 'none',
            background: active === l.href ? 'var(--pine)' : 'transparent',
            color: active === l.href ? 'var(--paper)' : 'var(--pine)',
            border: '1px solid var(--pine)',
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
