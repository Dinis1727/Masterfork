import Link from 'next/link';
import Image from 'next/image';
import HeroSection from '../components/HeroSection';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

// Server Component: renders static content; client effects come from AppClient in layout
export default function Home() {
  return (
    <div className="space-y-16">
      <HeroSection />

      <section
        data-reveal
        className="translate-y-6 rounded-3xl border border-bark-800/80 bg-bark-900/60 p-8 opacity-0 shadow-brand backdrop-blur-md sm:p-10"
        style={{ transitionDelay: '0.1s' }}
      >
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center rounded-full border border-bark-700/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amberglass">
              Formação Profissional
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Academia MasterFork</h2>
            <p className="text-bark-100/80">
              Acreditamos que a excelência nasce da aprendizagem contínua. Criámos programas para equipas de cozinha,
              pastelaria, bar e serviço de sala, com conteúdos modulares e acompanhamento personalizado.
            </p>
            <ul className="grid gap-3 text-sm text-bark-100/80 md:grid-cols-2">
              <li className="flex items-center gap-2 rounded-xl bg-bark-900/60 px-4 py-3">
                <span className="text-amberglass">✔</span> Chef formadores premiados
              </li>
              <li className="flex items-center gap-2 rounded-xl bg-bark-900/60 px-4 py-3">
                <span className="text-amberglass">✔</span> Planos híbridos (online + presencial)
              </li>
              <li className="flex items-center gap-2 rounded-xl bg-bark-900/60 px-4 py-3">
                <span className="text-amberglass">✔</span> Conteúdos certificados
              </li>
              <li className="flex items-center gap-2 rounded-xl bg-bark-900/60 px-4 py-3">
                <span className="text-amberglass">✔</span> Mentoria pós-formação
              </li>
            </ul>
          </div>
          <div className="flex-1 space-y-4 rounded-2xl bg-bark-950/60 p-6 shadow-soft">
            <h3 className="text-xl font-semibold text-white">📅 Próxima sessão imersiva</h3>
            <p className="text-sm font-medium uppercase tracking-widest text-amberglass/90">15 Dezembro 2025</p>
            <p className="text-sm leading-relaxed text-bark-100/80">
              Técnicas Avançadas de Cozinha Profissional <br />
              <span className="text-bark-200/90">Local:</span> MasterFork, Ovar <br />
            </p>
            <Link
              href="/training"
              className={`${pillBase} bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand`}
            >
              Saber mais &amp; inscrever-se
            </Link>
          </div>
        </div>
      </section>

      <section
        data-reveal
        className="grid translate-y-6 gap-8 rounded-3xl border border-bark-800/80 bg-bark-900/70 p-8 opacity-0 shadow-brand lg:grid-cols-[1.1fr_0.9fr]"
        style={{ transitionDelay: '0.2s' }}
      >
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-amberglass/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
            MasterBeer
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Cerveja artesanal portuguesa com assinatura MasterFork
          </h2>
          <p className="text-bark-100/80">
            Lotes pequenos, estações criteriosas e ingredientes locais. A MasterBeer acompanha cada prato com personalidade,
            oferecendo notas equilibradas, frutadas e tostadas para experiências memoráveis.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className={`${pillBase} bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand`}
            >
              Ver Loja
            </Link>
            <Link
              href="/orders"
              className={`${pillBase} border border-amberglass/50 text-amberglass hover:bg-amberglass/10`}
            >
              Pedir Degustação
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-amberglass/10 blur-3xl" aria-hidden="true" />
            <Image
              src="/Masterbeer.png"
              alt="Garrafa de cerveja artesanal MasterBeer"
              width={360}
              height={460}
              className="relative z-10 w-60 rounded-3xl border border-amberglass/20 bg-bark-950/80 p-6 shadow-soft md:w-72"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
