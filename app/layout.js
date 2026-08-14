import './globals.css';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
const { getLocale } = require('../lib/i18n');

export const metadata = {
  title: 'Houblon chez toi — Bières artisanales livrées à domicile',
  description: 'Bières françaises et belges, livrées à domicile dans le secteur de Bondues.',
};

export default function RootLayout({ children }) {
  const locale = getLocale();
  return (
    <html lang={locale}>
      <body>
        <SiteHeader locale={locale} />
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
