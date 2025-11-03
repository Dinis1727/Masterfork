import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthProvider from '../components/AuthProvider';

export const metadata = {
  title: 'MasterFork',
  description: 'Soluções de Hotelaria & Restauração',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <AuthProvider>
          <div className="app-shell">
            {/* Global header */}
            <Header />
            {/* Main content area */}
            <main className="content">{children}</main>
            {/* Global footer */}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
