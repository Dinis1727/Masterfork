export default function CatalogPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1>Catálogo MasterFork</h1>
        <p>
          Explore a nossa oferta integrada para transformar o seu negócio de restauração. Combine
          serviços à medida e conte com uma equipa pronta para implementar cada projecto.
        </p>
      </header>
      <div className="grid">
        {[
          {
            title: 'Cartas exclusivas',
            description:
              'Menus autorais criados por chefs parceiros, personalizáveis à identidade do seu espaço.',
          },
          {
            title: 'Equipamento profissional',
            description:
              'Fornecimento e instalação de cozinhas industriais, linhas de buffet e bar de alto desempenho.',
          },
          {
            title: 'Bebidas & pairing',
            description:
              'Selecção de vinhos, cervejas artesanais Masterbeer e cocktails assinatura para elevar cada serviço.',
          },
          {
            title: 'Consultoria contínua',
            description:
              'Acompanhamento mensal com indicadores de performance, formação de equipas e controlo de custos.',
          },
        ].map(({ title, description }) => (
          <article key={title} className="card">
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
