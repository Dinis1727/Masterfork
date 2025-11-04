"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

const NavLink = ({ href, children, cta = false, onClick }) => {
  const pathname = usePathname();
  // Determine active link based on current pathname
  const target = href.split('#')[0] || href;
  const isActive = target === '/' ? pathname === '/' : pathname.startsWith(target);
  const base = cta
    ? `${pillBase} bg-amber-gradient text-bark-900 shadow-soft hover:-translate-y-0.5 hover:shadow-brand`
    : `${pillBase} border border-transparent bg-transparent text-sm font-medium text-bark-100/90 hover:text-amberglass md:text-base`;
  const cls = isActive
    ? `${base} ${cta ? '' : 'border-amberglass/60 bg-amberglass/10 text-amberglass'}`
    : base;
  return (
    <Link href={href} className={cls} onClick={onClick}>
      {children}
    </Link>
  );
};

export default function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-bark-800/70 bg-bark-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-site items-center justify-between gap-4 px-4 py-4 sm:px-6 md:py-5">
        <div className="flex w-full items-center justify-between gap-3 md:w-auto">
          <Link href="/" aria-label="Ir para a página inicial" className="flex items-center gap-3">
            <Image
              src="/Masterfork-logotipo.png"
              width={104}
              height={104}
              alt="Logótipo MasterFork"
              className="h-12 w-auto md:h-14"
              priority
            />
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-bark-700/60 bg-bark-800/60 text-bark-100 transition hover:border-amberglass/70 hover:text-amberglass md:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="sr-only">{menuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}</span>
            {/* eslint-disable tailwindcss/classnames-order */}
            <span
              aria-hidden="true"
              className={`relative block h-0.5 w-6 rounded-full bg-current transition-all before:absolute before:block before:h-0.5 before:w-6 before:-translate-y-2 before:rounded-full before:bg-current before:transition-all after:absolute after:block after:h-0.5 after:w-6 after:translate-y-2 after:rounded-full after:bg-current after:transition-all ${
                menuOpen ? 'rotate-45 before:-rotate-90 before:translate-y-0 after:hidden after:translate-y-0' : ''
              }`}
            />
            {/* eslint-enable tailwindcss/classnames-order */}
          </button>
        </div>

        <nav
          id="site-nav"
          className={`flex flex-col gap-3 rounded-3xl border border-bark-900 bg-bark-950 p-6 shadow-brand md:static md:flex md:flex-row md:items-center md:gap-3 md:rounded-none md:border-none md:bg-transparent md:p-0 md:shadow-none ${
            menuOpen ? 'absolute left-4 right-4 top-full mt-4' : 'hidden md:flex'
          }`}
        >
          <NavLink href="/" onClick={() => setMenuOpen(false)}>Início</NavLink>
          <NavLink href="/services" onClick={() => setMenuOpen(false)}>Nossos Serviços</NavLink>
          <NavLink href="/shop" onClick={() => setMenuOpen(false)}>Loja</NavLink>
          <NavLink href="/contacts" onClick={() => setMenuOpen(false)}>Contactos</NavLink>
          {!loading && user ? (
            <NavLink href="/profile" cta onClick={() => setMenuOpen(false)}>Perfil</NavLink>
          ) : (
            <NavLink href="/login" cta onClick={() => setMenuOpen(false)}>Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
