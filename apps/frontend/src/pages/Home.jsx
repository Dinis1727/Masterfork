import React from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection.jsx';
import Masterbeer from '../assets/Masterbeer.png';
import useRevealOnScroll from '../hooks/useRevealOnScroll';

const Home = () => {
  useRevealOnScroll();

  return (
    <div className="page page--home">
      {/* Secção principal */}
      <HeroSection />

      {/* Formação Profissional */}
      <section className="training reveal" style={{ transitionDelay: '0.1s' }}>
        <div className="training__content">
          <h2>Formação Profissional MasterFork</h2>
          <p>
            Acreditamos que a excelência nasce da aprendizagem contínua. A MasterFork promove
            formações nas áreas de <strong>cozinha, pastelaria, serviço de mesa e bar</strong>,
            direcionadas a profissionais e entusiastas da restauração.
          </p>

          <div className="training__next">
            <h3>
              📅 Próxima Formação — <span className="highlighted">Em breve</span>
            </h3>
            <p>
              <strong>Data:</strong> 15 de Dezembro de 2025 <br />
              <strong>Tema:</strong> Técnicas Avançadas de Cozinha Profissional <br />
              <strong>Local:</strong> Escola de Hotelaria e Restauração do Porto <br />
            </p>
            <Link to="/formacoes" className="btn-primary">
              Saber Mais / Inscrever-se
            </Link>
          </div>
        </div>
      </section>

      {/* Secção MasterBeer */}
      <section className="masterbeer reveal" style={{ transitionDelay: '0.2s' }}>
        <div className="masterbeer__content">
          <h2>MasterBeer — Cerveja Artesanal Portuguesa</h2>
          <p>
            A MasterBeer é a marca de cervejas artesanais criada pela MasterFork, inspirada na arte
            de harmonizar sabores únicos com a gastronomia nacional. Produzida com ingredientes
            selecionados e paixão portuguesa, é a escolha ideal para brindar à excelência.
          </p>

          <div className="masterbeer__actions">
            <Link to="/encomendas" className="btn-primary">
              Fazer Encomenda
            </Link>
          </div>
        </div>

        <div className="masterbeer__media">
          <img
            src={Masterbeer}
            alt="Garrafa de cerveja artesanal MasterBeer"
            className="masterbeer__image"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
