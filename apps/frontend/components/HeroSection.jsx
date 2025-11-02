"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__media">
        {/* Optimized hero image */}
        <Image
          src="/masterfork-logo-v2.png"
          alt="Logótipo MasterFork — Hotelaria e Restauração"
          className="hero__image"
          width={420}
          height={420}
          priority
        />
      </div>

      <div className="hero__content">
        <h1>Junte-se a Nós!</h1>
        <p>
          A MasterFork reúne consultoria, formação de profissionais, renting de equipamentos e recrutamento.
          Para além disso, a MasterBeer — para apoiar a hotelaria e a restauração do planeamento à execução diária, 
          mantendo a experiência e o sabor no centro de cada detalhe.
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

