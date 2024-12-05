import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Masterfork_slogan.png';

const Header = () => {
  return (
    <header>
      <div className="logo-container">
        <Link to="/">
          <img src={logo} alt="Logo MasterFork" />
        </Link>
      </div>
      <nav>
        <Link to="/">Início</Link>
        <Link to="/about">Sobre Nós</Link>
        <Link to="/services">Serviços</Link>
        <Link to="/location">Localização</Link>
        <Link to="/contact">Contatos</Link>
      </nav>
    </header>
  );
};

export default Header;