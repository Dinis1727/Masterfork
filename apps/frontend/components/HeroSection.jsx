"use client";
import Link from 'next/link';
import Image from 'next/image';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

export default function HeroSection() {
  return (
    <section className="grid gap-10 overflow-hidden rounded-3xl border border-bark-800/70 bg-sand-gradient p-10 shadow-soft lg:grid-cols-2 lg:items-center">
      <div className="order-2 space-y-6 text-bark-900 lg:order-1">
        <span className="inline-flex items-center rounded-full bg-bark-900/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-bark-700">
          MasterFork 2025
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-bark-900 sm:text-5xl">
          Gastronomia com tecnologia, hospitalidade com alma.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-bark-700">
          Elevamos cozinhas, equipas e experiências através de consultoria estratégica, formação especializada,
          renting de equipamentos e recrutamento premium. Um ecossistema completo para operações que procuram excelência.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/services" className={`${pillBase} bg-bark-900 text-white shadow-brand hover:bg-bark-800`}>
            Explorar Serviços
          </Link>
          <Link
            href="/shop"
            className={`${pillBase} border border-bark-900/40 bg-white/70 text-bark-900 hover:border-bark-900 hover:bg-white`}
          >
            Ver Loja MasterBeer
          </Link>
        </div>
      </div>

      <div className="order-1 flex justify-center lg:order-2">
        <div className="relative flex h-full w-full max-w-sm items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amberglass/20 blur-3xl" aria-hidden="true" />
          <Image
            src="/masterfork-logo-v2.png"
            alt="Logótipo MasterFork — Hotelaria e Restauração"
            className="relative z-10 h-auto w-72 drop-shadow-xl md:w-80"
            width={320}
            height={320}
            priority
          />
        </div>
      </div>
    </section>
  );
}
