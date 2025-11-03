import Link from 'next/link';
import Image from 'next/image';
import HeroSection from '../components/HeroSection';
import HomeClient from '../components/HomeClient';

// Server Component: renders static content; client effects live in HomeClient
export default function Home() {
  return (
    <div className="page page--home">
      {/* Attach client-only effects */}
      <HomeClient />
      <HeroSection />

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
              <strong>Local:</strong> Masterfork <br />
            </p>
            <Link href="/training" className="btn-primary">
              Saber Mais / Inscrever-se
            </Link>
          </div>
        </div>
      </section>

      <section className="masterbeer reveal" style={{ transitionDelay: '0.1s' }}>
        <div className="masterbeer__content">
          <h2>MasterBeer — Cerveja Artesanal Portuguesa</h2>
          <p>
            A MasterBeer é a marca de cervejas artesanais criada pela MasterFork, inspirada na arte
            de harmonizar sabores únicos com a gastronomia nacional. Produzida com ingredientes
            selecionados e paixão portuguesa, é a escolha ideal para brindar à excelência.
          </p>

          <div className="masterbeer__actions">
            <Link href="/shop" className="btn-primary"> Ver Loja</Link>
          </div>
        </div>

        <div className="masterbeer__media">
          {/* Optimized product image */}
          <Image
            src="/Masterbeer.png"
            alt="Garrafa de cerveja artesanal MasterBeer"
            className="masterbeer__image"
            width={540}
            height={360}
          />
        </div>
      </section>
    </div>
  );
}
