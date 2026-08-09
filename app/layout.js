import './globals.css';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

export const metadata = {
  title: 'Houblon chez toi — Bières artisanales livrées à domicile',
  description: 'Bières françaises et belges, livrées à domicile dans le secteur de Bondues.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
