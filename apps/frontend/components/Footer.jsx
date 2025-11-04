import Link from 'next/link';

const social = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/_masterfork_',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5Zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5Zm6.25-4a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 18.25 5.5Z"
        />
      </svg>
    ),
  },
  {
    name: 'Email',
    href: 'mailto:geral@masterfork.pt',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <path
          fill="currentColor"
          d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2Zm0 2v.01L12 12l8-5.99V6H4Zm16 12V9.2l-7.12 5.34a1.5 1.5 0 0 1-1.76 0L4 9.21V18h16Z"
        />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-gradient text-bark-100">
      <div className="mx-auto w-full max-w-site px-4 sm:px-6">
        <div className="flex flex-col gap-12 border-b border-bark-800/50 py-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-semibold text-white">MasterFork</h2>
            <p className="text-sm leading-relaxed text-bark-100/80">
              Experiência, rigor e paixão pela restauração. Desenvolvemos equipas, integramos soluções e
              entregamos consultoria estratégica para levar a excelência portuguesa a cada serviço.
            </p>
            <div className="flex items-center gap-3">
              {social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amberglass/40 bg-white/5 text-amberglass transition hover:bg-white/10"
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                  aria-label={item.name}
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid w-full gap-8 text-sm sm:grid-cols-2 md:max-w-xl">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Links Úteis</h3>
              <ul className="space-y-2 text-bark-100/80">
                <li>
                  <Link href="/shop" className="hover:text-amberglass">Todos os Produtos</Link>
                </li>
                <li>
                  <Link href="/contacts" className="hover:text-amberglass">Contactos</Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-amberglass">Pedidos &amp; Encomendas</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Contacto</h3>
              <ul className="space-y-2 text-bark-100/80">
                <li className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path
                      fill="currentColor"
                      d="M6.6 10.79a15.91 15.91 0 0 0 6.61 6.61l2.2-2.2a1 1 0 0 1 1.02-.24 12.46 12.46 0 0 0 3.9.62 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.42a1 1 0 0 1 1 1 12.46 12.46 0 0 0 .62 3.9 1 1 0 0 1-.25 1.02l-2.19 2.2Z"
                    />
                  </svg>
                  <span>+351 963 962 074</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path
                      fill="currentColor"
                      d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6c0-1.1.9-2 2-2Zm0 2v.01L12 12l8-5.99V6H4Zm16 12V9.2l-7.12 5.34a1.5 1.5 0 0 1-1.76 0L4 9.21V18h16Z"
                    />
                  </svg>
                  <span>geral@masterfork.pt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-bark-100/60 md:flex-row">
          <span>© {new Date().getFullYear()} MasterFork. Todos os direitos reservados.</span>
          <span>Elevamos sabores portugueses com tecnologia e hospitalidade.</span>
        </div>
      </div>
    </footer>
  );
}
