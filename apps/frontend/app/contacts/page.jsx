"use client";
import Image from 'next/image';

const MAP_EMBED =
  'https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d328.1934795397188!2d-8.658861775249601!3d40.85829732834936!3m2!1i1024!2i768!4f13.1!5e1!3m2!1spt-BR!2sus!4v1762177189959!5m2!1spt-BR!2sus';

const pillBase =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2 font-semibold tracking-wide transition duration-200';

export default function ContactsPage() {
  return (
    <div className="space-y-12">
      <section
        data-reveal
        className="translate-y-6 space-y-6 opacity-0"
        style={{ transitionDelay: '0.05s' }}
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-amberglass/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amberglass">
              Os Nossos Contactos
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Fale connosco</h1>
          </div>
          <div className="rounded-full border border-bark-700/70 bg-bark-900/60 px-5 py-2 text-sm text-amberglass">
            Disponíveis de Segunda a Sábado — resposta em menos de 24h.
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <article className="space-y-3 rounded-3xl border border-bark-700/60 bg-bark-800/60 p-6 text-sm text-bark-100/80 shadow-brand backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Horário</h2>
            <p>Segunda a Sexta: <span className="text-amberglass">08h00 - 20h00</span></p>
            <p>Sábado: <span className="text-amberglass">08h30 - 17h00</span></p>
            <p>Domingo: <span className="text-amberglass">Encerrados</span></p>
          </article>
          <article className="space-y-3 rounded-3xl border border-bark-700/60 bg-bark-800/60 p-6 text-sm text-bark-100/80 shadow-brand backdrop-blur-md">
            <h2 className="text-lg font-semibold text-white">Contactos</h2>
            <p>
              <a href="tel:+351963962074" className="text-amberglass hover:underline">
                +351 963 962 074
              </a>
            </p>
            <p>
              <a href="mailto:geral@masterfork.pt" className="text-amberglass hover:underline">
                geral@masterfork.pt
              </a>
            </p>
            <p>Rua Família de Colares Pinto 1695, 3880-163 Ovar</p>
          </article>
        </div>
      </section>

      <section
        data-reveal
        className="grid translate-y-6 gap-8 rounded-3xl border border-bark-800/70 bg-bark-900/70 p-6 opacity-0 shadow-brand lg:grid-cols-[1.1fr_0.9fr]"
        style={{ transitionDelay: '0.15s' }}
      >
        <div className="overflow-hidden rounded-2xl border border-bark-800/70 bg-bark-950/60 backdrop-blur-md">
          <iframe
            title="Localização MasterFork"
            src={MAP_EMBED}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[320px] w-full border-0 md:h-full"
          />
        </div>
        <div className="flex flex-col justify-between gap-8 rounded-2xl bg-bark-950/60 p-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-white">Visite as nossas instalações</h2>
            <p className="text-sm text-bark-100/80">
              Acolhemos reuniões estratégicas, sessões de formação e degustações privadas. Informe-nos com antecedência para preparar a experiência ideal para a sua equipa.
            </p>
          </div>
          <div className="space-y-3 text-sm text-bark-100/80">
            <div className="flex items-center gap-3 rounded-2xl border border-amberglass/30 bg-amberglass/5 px-4 py-3">
              <span className="text-amberglass">📍</span> Rua Família de Colares Pinto 1695, 3880-163 Ovar
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-amberglass/30 bg-amberglass/5 px-4 py-3">
              <span className="text-amberglass">🕑</span> Agendamento prévio para visitas guiadas e provas MasterBeer.
            </div>
          </div>
        </div>
      </section>

      <section
        data-reveal
        className="flex translate-y-6 flex-col gap-8 rounded-3xl border border-bark-800/70 bg-brand-gradient p-10 opacity-0 shadow-brand lg:flex-row lg:items-center"
        style={{ transitionDelay: '0.25s' }}
      >
        <div className="flex-1 space-y-4 text-bark-100">
          <h2 className="text-3xl font-semibold text-white">A sua opinião é importante</h2>
          <p className="text-sm leading-relaxed text-bark-100/80">
            Partilhe a sua experiência com a MasterFork e ajude-nos a elevar continuamente os padrões do sector.
            Cada review é analisada pela nossa equipa para aprimorar serviços e formações.
          </p>
          <a
            href="https://www.google.com/search?sca_esv=16afa8dc77c0fa71&sxsrf=AHTn8zqYDGDenbM5GTd26zwA1AOe4q-94A:1739482785344&si=APYL9bs7Hg2KMLB-4tSoTdxuOx8BdRvHbByC_AuVpNyh0x2KzSvS6J0cxQaVVdjnqh6SaUpj83ZJWJ16GyH22w1HZtJJlj_k_kH1Qiy5aWukhG8O6ZLZdLFppvmCzHuAcMBfxh0_wfnp&q=MASTERFORK+Cr%C3%ADticas&sa=X&ved=2ahUKEwjlj42szsGLAxV3lP0HHdYFOT0Q0bkNegQIJBAD&biw=1412&bih=710&dpr=2"
            target="_blank"
            rel="noreferrer"
            className={`${pillBase} bg-white text-bark-900 shadow-soft hover:bg-amberglass/90 hover:text-bark-900`}
          >
            Deixar Review
          </a>
        </div>
        <div className="flex-1">
          <div className="relative mx-auto max-w-xs">
            <div className="absolute inset-0 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
            <Image
              src="/contacts/masterfork-agradece.png"
              alt="MasterFork agradece"
              width={360}
              height={330}
              priority
              className="relative z-10 w-full drop-shadow-2xl"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
