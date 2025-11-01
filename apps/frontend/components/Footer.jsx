export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <p>© {new Date().getFullYear()} MasterFork. Todos os direitos reservados.</p>
        <p>
          R. Família Colares Pinto 1695, 3880-163 Ovar
          <a href="tel:+351963962074" className="footer__link"> +351 963 962 074</a>
        </p>
        <p>
          Siga-nos no Instagram
          <a
            href="https://www.instagram.com/_masterfork_/"
            target="_blank"
            rel="noreferrer"
            className="footer__link"
          >
            @_masterfork_
          </a>
        </p>
      </div>
    </footer>
  );
}
