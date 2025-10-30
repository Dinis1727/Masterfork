import React from 'react';
import { Link } from 'react-router-dom';
import MasterforkLogo from '../assets/Masterfork.png';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero__media">
        <img
          src={MasterforkLogo}
          alt="Logótipo MasterFork — Hotelaria e Restauração"
          className="hero__image"
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
          <Link to="/catalogo" className="btn-secondary">
            Contratar Serviço
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
