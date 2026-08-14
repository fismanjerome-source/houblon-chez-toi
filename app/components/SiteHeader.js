import Logo from './Logo';
import SearchBar from './SearchBar';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from './LanguageSwitcher';

export default function SiteHeader({ locale = 'fr' }) {
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
          <LanguageSwitcher locale={locale} />
          <SearchBar locale={locale} />
          <a href="/compte" className="btn" style={{ flexShrink: 0 }}>{locale === 'nl' ? 'Mijn account' : 'Mon compte'}</a>
          <MobileMenu locale={locale} />
        </div>
      </div>
    </header>
  );
}
