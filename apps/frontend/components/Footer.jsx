export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <p>© {new Date().getFullYear()} MasterFork. Todos os direitos reservados.</p>
        <p>
          Rua da Gastronomia, 123 · Porto ·
          <a href="tel:+351220000000" className="footer__link"> +351 220 000 000</a>
        </p>
        <p>
          Siga-nos no Instagram
          <a
            href="https://www.instagram.com/masterfork"
            target="_blank"
            rel="noreferrer"
            className="footer__link"
          >
            @masterfork
          </a>
        </p>
      </div>
    </footer>
  );
}
