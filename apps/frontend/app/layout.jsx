import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'MasterFork',
  description: 'Soluções de Hotelaria & Restauração',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body>
        <div className="app-shell">
          {/* Global header */}
          <Header />
          {/* Main content area */}
          <main className="content">{children}</main>
          {/* Global footer */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
