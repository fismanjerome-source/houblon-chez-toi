import './globals.css';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
const { getLocale } = require('../lib/i18n');
const { getTheme } = require('../lib/theme');

export const metadata = {
  title: 'Houblon chez toi — Bières artisanales livrées à domicile',
  description: 'Bières françaises et belges, livrées à domicile dans le secteur de Bondues.',
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
