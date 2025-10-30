import React from 'react';

const Formacoes = () => {
  return (
    <div className="page">
      <header className="page__header">
        <h1>Formações MasterFork</h1>
        <p>
          A MasterFork promove formações profissionais nas áreas de <strong>cozinha</strong>,{' '}
          <strong>pastelaria</strong>, <strong>serviço de mesa</strong> e <strong>bar</strong>,
          destinadas a profissionais e entusiastas da restauração que procuram elevar as suas
          competências.
        </p>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Cozinha Profissional</h2>
          <p>
            Aprenda técnicas modernas de confeção e empratamento, com foco na qualidade e eficiência
            de cozinha.
          </p>
        </div>
        <div className="card">
          <h2>Pastelaria e Padaria</h2>
          <p>
            Descubra o segredo por trás das sobremesas perfeitas e domine o fabrico de pão
            artesanal.
          </p>
        </div>
        <div className="card">
          <h2>Serviço de Mesa e Bar</h2>
          <p>
            Melhore a experiência do cliente com técnicas de atendimento e mixologia profissional.
          </p>
        </div>
      </section>

      <section className="form">
        <h2>Inscreva-se</h2>
        <p>Preencha o formulário abaixo para garantir a sua vaga na próxima formação.</p>

        <form>
          <div className="form__row">
            <label htmlFor="nome">Nome Completo</label>
            <input type="text" id="nome" name="nome" required />
          </div>

          <div className="form__row">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className="form__row">
            <label htmlFor="formacao">Área de Interesse</label>
            <select id="formacao" name="formacao" required>
              <option value="">Selecione uma opção</option>
              <option value="cozinha">Cozinha Profissional</option>
              <option value="pastelaria">Pastelaria e Padaria</option>
              <option value="mesa">Serviço de Mesa e Bar</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Enviar Inscrição
          </button>
        </form>
      </section>
    </div>
  );
};

export default Formacoes;
