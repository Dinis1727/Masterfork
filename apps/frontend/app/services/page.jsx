import Link from 'next/link';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

const services = [
  {
    id: 'consultoria',
    title: 'Consultoria Estratégica',
    intro:
      'Mapeamos processos, redesenhamos operações e definimos roadmaps executáveis para restaurantes, hotéis e dark kitchens.',
    details:
      'Do diagnóstico aos indicadores de performance: implementamos tecnologia, métricas e rituais operacionais para criar equipas de alta performance.',
    cta: 'Falar com consultor',
  },
  {
    id: 'formacao',
    title: 'Academia & Formação',
    intro:
      'Planos de formação contínua para cozinha, bar, pastelaria e serviço de sala. Métodos blended com mentoria e certificação.',
    details:
      'Programas imersivos adaptados à cultura da sua marca, com avaliação prática, e-learning e turmas in company.',
    cta: 'Calendário de cursos',
  },
  {
    id: 'renting',
    title: 'Renting de Equipamentos',
    intro:
      'Infraestrutura moderna sem investimento inicial: cozinhas modulares, cafetarias, equipamentos de frio e pastelaria.',
    details:
      'Modelos mensais transparentes com instalação, manutenção preventiva e suporte 24/7. Atualize o parque tecnológico quando precisar.',
    cta: 'Simular plano',
  },
  {
    id: 'recrutamento',
    title: 'Recrutamento & Talent Hub',
    intro:
      'Ligamos talento especializado às operações certas. Recrutamento técnico com onboarding, avaliação cultural e mentoring.',
    details:
      'Workshops e bootcamps para equipas recém-formadas, garantindo retenção e consistência de serviço.',
    cta: 'Solicitar shortlist',
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-12 text-bark-100">
      <header
        data-reveal
        className="translate-y-6 space-y-4 text-center opacity-0"
        style={{ transitionDelay: '0.05s' }}
      >
        <span className="inline-flex items-center rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
          Os Nossos Serviços
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Parceiros em cada etapa do seu projecto</h1>
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-bark-100/80 sm:text-base">
          Da concepção estratégica à operação diária, combinamos consultoria, formação, tecnologia e talento para entregar experiências memoráveis na hotelaria e restauração.
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-2" aria-label="Lista de serviços">
        {services.map(({ id, title, intro, details, cta }, index) => (
          <article
            key={id}
            data-reveal
            className="flex h-full translate-y-6 flex-col overflow-hidden rounded-3xl border border-bark-800/60 bg-bark-900/70 opacity-0 shadow-brand backdrop-blur-md"
            style={{ transitionDelay: `${0.1 + index * 0.05}s` }}
          >
            <div
              className="relative h-48 overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-bark-900/60 via-transparent to-bark-950/80" />
              <div
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(/services/${id}.png)`,
                }}
              />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-white">{title}</h2>
                <p className="text-sm text-amberglass/80">{intro}</p>
                <p className="text-sm text-bark-100/70">{details}</p>
              </div>
              <div className="mt-auto">
                <Link
                  className={`${pillBase} bg-amber-gradient text-bark-900 shadow-soft hover:shadow-brand`}
                  href={id === 'formacao' ? '/training' : id === 'renting' ? '/contacts?type=renting' : '/contacts'}
                >
                  {cta}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
