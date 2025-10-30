import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/Masterfork_slogan.png';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero__media">
        <img src={heroImage} alt="MasterFork - A receita certa para o seu negócio" />
      </div>
      <div className="hero__content">
        <h1>A receita certa para elevar o seu serviço</h1>
        <p>
          A MasterFork fornece soluções completas para hotelaria e restauração: do equipamento
          profissional às cartas exclusivas e formação de equipas. Somos o parceiro que coloca o
          sabor e a experiência no centro de cada detalhe.
        </p>
        <Link to="/encomendas" className="button button--primary">
          Fazer Encomenda
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
