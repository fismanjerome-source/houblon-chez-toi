import Logo from './Logo';
import SearchBar from './SearchBar';

export default function SiteHeader() {
  return (
    <header style={{ borderBottom: '1px solid var(--line)' }}>
      <div
        className="wrap"
        style={{ padding: '16px 0', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <a href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Logo />
        </a>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <SearchBar />
          <a href="/compte" className="btn" style={{ flexShrink: 0 }}>Mon compte</a>
        </div>
      </div>
    </header>
  );
}
