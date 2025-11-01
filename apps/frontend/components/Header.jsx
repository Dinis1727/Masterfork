"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NavLink = ({ href, children, cta = false }) => {
  const pathname = usePathname();
  // Determine active link based on current pathname
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
  const base = 'nav__link' + (cta ? ' nav__cta' : '');
  const cls = isActive ? `${base} nav__link--active` : base;
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
};

export default function Header() {
  return (
    <header className="header">
      <div className="brand">
        {/* Optimized brand image with next/image */}
        <Image src="/Masterfork.png" width={56} height={56} alt="Logótipo MasterFork" className="brand__logo" />
        <div className="brand__text">
          <span className="brand__title">MasterFork</span>
          <span className="brand__subtitle">Hotelaria &amp; Restauração</span>
        </div>
      </div>
      <nav className="nav">
        <NavLink href="/">Início</NavLink>
        <NavLink href="/catalog">Catálogo</NavLink>
        <NavLink href="/orders" cta>Fazer Encomenda</NavLink>
      </nav>
    </header>
  );
}
