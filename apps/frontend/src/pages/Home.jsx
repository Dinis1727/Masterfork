import React from 'react';
import HeroSection from '../components/HeroSection.jsx';
import Masterbeer from '../assets/Masterbeer.png';

const Home = () => {
  return (
    <div className="page page--home">
      <HeroSection />
      <section className="highlight">
        <div className="highlight__text">
          <h2>Experiência MasterFork</h2>
          <p>
            Desde 2010 acompanhamos hotéis, bares e restaurantes em toda a região norte. A nossa
            equipa multidisciplinar ajuda a desenhar menus vencedores, optimiza operações de cozinha
            e garante um serviço de sala memorável.
          </p>
          <p>
            Trabalhamos com marcas premium de bebidas, equipamento certificado e parceiros que
            partilham a nossa paixão por gastronomia. Connosco, o seu negócio está preparado para
            surpreender em cada prato e brindar com confiança.
          </p>
        </div>
        <div className="highlight__media">
          <img src={Masterbeer} alt="Tábua MasterFork com pairing de cerveja artesanal" />
        </div>
      </section>
    </div>
  );
};

export default Home;
