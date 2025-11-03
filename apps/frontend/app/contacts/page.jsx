"use client";
import Image from "next/image";

const MAP_EMBED =
  "https://maps.google.com/maps?q=R.%20Fam%C3%ADlia%20Colares%20Pinto%201695%2C%203880-163%20Ovar&t=&z=16&ie=UTF8&iwloc=&output=embed";

export default function ContactsPage() {
  return (
    <div className="page contacts-page">
        <section className="contacts-info">
        <h2>Contactos</h2>
        <hr />
        <div className="contacts-info__grid">
          <article>
            <h3>Horário</h3>
            <p>Segunda a Sexta:<br /> 08h00 - 20h00</p>
            <p>Sábado:<br /> 08h30 - 17h00</p>
            <p>Domingo:<br /> Encerrados</p>
          </article>
          <article>
            <h3>Contactos</h3>
            <p>
              <a href="tel:+351963962074" className="contacts-link">
                +351 963 962 074
              </a>
            </p>
            <p>
              <a href="mailto:geral@masterfork.pt" className="contacts-link">
                geral@masterfork.pt
              </a>
            </p>
          </article>
          <article>
            <h3>Morada</h3>
            <p>Rua Família de Colares Pinto 1695,</p>
            <p>3880-163 Ovar</p>
          </article>
        </div>
      </section>
      <section className="contacts-highlight">
        <div className="contacts-highlight__map">
          <iframe
            title="Localização MasterFork"
            src={MAP_EMBED}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="contacts-highlight__info">
          <h1>Faça uma visita às nossas instalações</h1>
          <hr />
          <p>Rua Família de Colares Pinto 1695</p>
          <p>3880-163 Ovar</p>
        </div>
      </section>

      <section className="contacts-review">
        <div className="contacts-review__content">
          <h2>A sua opinião é importante para nós</h2>
          <p>
            Se já colaborou connosco, partilhe a sua opinião e sugestões. O seu feedback é
            essencial para continuarmos a evoluir e oferecer o melhor serviço.
          </p>
          <a
            href="https://www.google.com/search?sca_esv=16afa8dc77c0fa71&sxsrf=AHTn8zqYDGDenbM5GTd26zwA1AOe4q-94A:1739482785344&si=APYL9bs7Hg2KMLB-4tSoTdxuOx8BdRvHbByC_AuVpNyh0x2KzSvS6J0cxQaVVdjnqh6SaUpj83ZJWJ16GyH22w1HZtJJlj_k_kH1Qiy5aWukhG8O6ZLZdLFppvmCzHuAcMBfxh0_wfnp&q=MASTERFORK+Cr%C3%ADticas&sa=X&ved=2ahUKEwjlj42szsGLAxV3lP0HHdYFOT0Q0bkNegQIJBAD&biw=1412&bih=710&dpr=2"
            target="_blank"
            rel="noreferrer"
            className="btn-primary contacts-review__cta"
          >
            Deixar Review
          </a>
        </div>
        <div className="contacts-review__image" aria-hidden="true">
          <Image
            src="/contacts/masterfork-agradece.png"
            alt="MasterFork agradece"
            width={360}
            height={330}
            priority
          />
        </div>
      </section>
    </div>
  );
}
