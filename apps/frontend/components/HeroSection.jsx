"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__media">
        {/* Optimized hero image */}
        <Image
          src="/masterfork-logo.png"
          alt="Logótipo MasterFork — Hotelaria e Restauração"
          className="hero__image"
          width={420}
          height={420}
          priority
        />
      </div>

      <div className="hero__content">
        <h1>A receita certa para elevar o seu serviço</h1>
        <p>
          A MasterFork fornece soluções completas para hotelaria e restauração: do equipamento
          profissional às cartas exclusivas e formação de equipas. Somos o parceiro que coloca o
          sabor e a experiência no centro de cada detalhe.
        </p>

        <div className="hero__actions">
          <Link href="/services" className="btn-secondary">
            Contratar Serviço
          </Link>
        </div>
      </div>
    </section>
  );
}
