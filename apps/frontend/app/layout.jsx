import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthProvider from '../components/AuthProvider';
import AppClient from '../components/AppClient';

export const metadata = {
  title: 'MasterFork',
  description: 'Soluções de Hotelaria & Restauração',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-bark-950 text-bark-50">
        <AppClient />
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              <div className="mx-auto w-full max-w-site px-4 py-10 sm:px-6 md:py-14">{children}</div>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
