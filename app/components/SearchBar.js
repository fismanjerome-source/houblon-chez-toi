'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function SearchBar({ locale = 'fr' }) {
  const [beers, setBeers] = useState([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    fetch('/api/beers').then((res) => res.ok && res.json()).then((data) => data && setBeers(data));
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const results = query.trim()
    ? beers.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  function goToBeer(id) {
    setQuery('');
    setOpen(false);
    if (window.location.pathname !== '/') {
      window.location.href = `/#beer-${id}`;
    } else {
      const el = document.getElementById(`beer-${id}`);
      if (el) {
        window.location.hash = `beer-${id}`;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  return (
    <div ref={boxRef} className="search-bar" style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
      <div style={{ position: 'relative' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} aria-hidden="true">
          <path d="M4 4v16l7-4 7 4V4" stroke="var(--copper)" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={locale === 'nl' ? 'Vind je bier!' : 'Trouve ta bière !'}
          style={{
            width: '100%',
            padding: '9px 12px 9px 34px',
            border: '1px solid var(--line)',
            borderRadius: 20,
            fontFamily: 'Public Sans, sans-serif',
            fontSize: 13.5,
            background: 'var(--paper)',
          }}
        />
      </div>

      {open && query.trim() && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, right: 0, background: 'var(--paper)',
          border: '1px solid var(--line)', borderRadius: 8, boxShadow: '0 8px 24px rgba(var(--ink-rgb),0.15)',
          zIndex: 20, maxHeight: 320, overflowY: 'auto',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: 14, fontSize: 13, color: 'rgba(var(--ink-rgb),0.5)' }}>{locale === 'nl' ? 'Geen bier gevonden.' : 'Aucune bière trouvée.'}</div>
          ) : (
            results.map((b) => (
              <div
                key={b.id}
                onClick={() => goToBeer(b.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}
                onMouseDown={(e) => e.preventDefault()}
              >
                {b.bottleImageUrl ? (
                  <Image src={b.bottleImageUrl} alt="" width={24} height={48} style={{ width: 24, height: 48, objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: 24, height: 48 }} />
                )}
                <div>
                  <div style={{ fontSize: 13.5 }}>{b.name}</div>
                  {b.abv > 0 && <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10.5, color: 'rgba(var(--ink-rgb),0.5)' }}>{b.abv}% vol.</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
