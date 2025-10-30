import React from 'react';

const Encomendas = () => {
  return (
    <div className="page">
      <header className="page__header">
        <h1>Fazer Encomenda</h1>
        <p>
          Partilhe connosco os detalhes da sua necessidade e entraremos em contacto em menos de 24h
          para personalizar a solução MasterFork para o seu negócio.
        </p>
      </header>
      <form className="form">
        <div className="form__row">
          <label htmlFor="name">Nome do responsável</label>
          <input type="text" id="name" name="name" placeholder="Ana Sousa" required />
        </div>
        <div className="form__row">
          <label htmlFor="business">Nome do estabelecimento</label>
          <input type="text" id="business" name="business" placeholder="Restaurante Sabor & Arte" required />
        </div>
        <div className="form__row">
          <label htmlFor="email">Email profissional</label>
          <input type="email" id="email" name="email" placeholder="ana@masterfork.pt" required />
        </div>
        <div className="form__row">
          <label htmlFor="services">Serviços de interesse</label>
          <select id="services" name="services" multiple>
            <option value="menus">Criação de menu & carta de bebidas</option>
            <option value="equipamento">Equipamento de cozinha / bar</option>
            <option value="formacao">Formação de equipas</option>
            <option value="consultoria">Consultoria operacional</option>
          </select>
        </div>
        <div className="form__row">
          <label htmlFor="message">Conte-nos mais sobre o seu projecto</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            placeholder="Datas previstas, número de lugares, conceitos a explorar..."
          />
        </div>
        <button type="submit" className="button button--primary">
          Enviar pedido
        </button>
      </form>
    </div>
  );
};

export default Encomendas;
