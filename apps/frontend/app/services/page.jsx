const services = [
  {
    id: 'consultoria',
    title: 'Consultoria',
    intro:
      'Desenvolvemos estratégias inovadoras para optimizar operações e garantir um crescimento sustentável para o seu projecto.',
    details:
      'Mapeamos processos, desenhamos planos de implementação e acompanhamo-lo desde a visão até aos resultados medidos.',
  },
  {
    id: 'formacao',
    title: 'Formação',
    intro:
      'Com programas focados nas necessidades do mercado, formamos equipas experientes e um serviço consistente.',
    details:
      'Academias presenciais e digitais com chefs, baristas e gestores especializados para capacitar cada área do negócio.',
  },
  {
    id: 'renting',
    title: 'Renting',
    intro:
      'Acesso a soluções flexíveis de equipamentos sem o investimento inicial elevado exigido pelos sectores gastronómicos.',
    details:
      'Planos mensais transparentes que incluem instalação, manutenção preventiva e substituição em caso de avaria.',
  },
  {
    id: 'recrutamento',
    title: 'Recrutamento',
    intro:
      'Identificamos e recrutamos profissionais qualificados nas melhores operações de hotelaria.',
    details:
      'Processos personalizados que combinam avaliação técnica, cultural e formação de integração para maximizar a retenção.',
  },
];

export default function ServicesPage() {
  return (
    <div className="page services-page">
      <header className="page__header">
        <p className="eyebrow">Os Nossos Serviços</p>
        <h1>Parceiros em cada etapa do seu projecto</h1>
        <p>
          Inspirados na oferta da MasterFork, condensámos a nossa proposta em quatro pilares. Desde a
          concepção estratégica até à entrega diária, trabalhamos lado a lado com a sua equipa para garantir
          experiências memoráveis em sala e cozinha.
        </p>
      </header>
      <section className="services-grid" aria-label="Lista de serviços">
        {services.map(({ id, title, intro }) => (
          <article key={id} className="service-card" id={id}>
            <div
              className={`service-card__media service-card__media--${id}`}
              aria-hidden="true"
              style={{
                backgroundImage: `url(/services/${id}.webp), url(/services/${id}.jpg), url(/services/${id}.png)`,
              }}
            />
            <div className="service-card__body">
              <h2>{title}</h2>
              <p className="service-card__intro">{intro}</p>
              <a className="service-card__link" href={`#${id}`}>
                Saber mais
              </a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
