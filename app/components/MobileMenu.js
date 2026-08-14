'use client';
import { useState, useEffect, useRef } from 'react';

const LINKS = [
  { href: '/', emoji: '🏠', label: 'Accueil' },
  { href: '/#catalogue', emoji: '🍺', label: 'Nos bières' },
  { href: '/qui-sommes-nous', emoji: '👨‍👩‍👧', label: 'Qui sommes-nous' },
  { href: '/histoire', emoji: '📜', label: 'Histoire de la bière' },
  { href: '/verres', emoji: '🍷', label: 'Histoire des verres' },
  { href: '/avis', emoji: '⭐', label: 'Avis clients' },
  { href: '/faq', emoji: '❓', label: 'FAQ' },
  { href: '/compte', emoji: '👤', label: 'Mon compte' },
  { href: '/contact', emoji: '💬', label: 'Contact' },
  { href: '/cgu', emoji: '📄', label: 'CGU' },
  { href: '/mentions-legales', emoji: '⚖️', label: 'Mentions légales' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
          width: 36, height: 36, background: 'transparent', border: '1px solid var(--line)',
          borderRadius: 6, cursor: 'pointer', padding: 0,
        }}
      >
        <span style={{ width: 18, height: 2, background: 'var(--pine)', margin: '0 auto', borderRadius: 2 }} />
        <span style={{ width: 18, height: 2, background: 'var(--pine)', margin: '0 auto', borderRadius: 2 }} />
        <span style={{ width: 18, height: 2, background: 'var(--pine)', margin: '0 auto', borderRadius: 2 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '120%', right: 0, minWidth: 200, background: 'var(--paper)',
          border: '1px solid var(--line)', borderRadius: 8, boxShadow: '0 8px 24px rgba(15,23,18,0.15)',
          zIndex: 30, overflow: 'hidden',
        }}>
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                fontSize: 14, color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--line)',
              }}
            >
              <span style={{ fontSize: 16 }}>{l.emoji}</span>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
