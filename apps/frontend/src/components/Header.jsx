import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/Masterfork.png';

const navClassName = ({ isActive }) =>
  isActive ? 'nav__link nav__link--active' : 'nav__link';

const Header = () => {
  return (
    <header className="header">
      <div className="brand">
        <img src={logo} alt="MasterFork" className="brand__logo" />
        <div className="brand__text">
          <span className="brand__title">MasterFork</span>
          <span className="brand__subtitle">Hotelaria &amp; Restauração</span>
        </div>
      </div>
      <nav className="nav">
        <NavLink to="/" end className={navClassName}>
          Home
        </NavLink>
        <NavLink to="/catalogo" className={navClassName}>
          Catálogo
        </NavLink>
        <NavLink to="/encomendas" className={({ isActive }) =>
          isActive ? 'nav__link nav__link--active nav__cta' : 'nav__link nav__cta'
        }>
          Fazer Encomenda
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
