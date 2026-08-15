import './globals.css';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
const { getLocale } = require('../lib/i18n');
const { getTheme } = require('../lib/theme');

const SITE_URL = process.env.SITE_URL || 'https://houblon-chez-toi-kohl.vercel.app';
const TITLE = 'Houblon chez toi — Bières artisanales livrées à domicile';
const DESCRIPTION = 'Bières françaises et belges, livrées à domicile dans le secteur de Bondues.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'Houblon chez toi',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Houblon chez toi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  const locale = getLocale();
  const theme = getTheme();
  return (
    <html lang={locale} data-theme={theme}>
      <body>
        <SiteHeader locale={locale} theme={theme} />
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
