const db = require('../db');

// Validação do formulário do frontend
const validateOrder = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('O nome do responsável é obrigatório.');
  }

  if (!data.business || typeof data.business !== 'string') {
    errors.push('O nome do estabelecimento é obrigatório.');
  }

  if (!data.email || !data.email.includes('@')) {
    errors.push('O email profissional é inválido.');
  }

  if (!data.services) {
    errors.push('O campo "Serviços de interesse" é obrigatório.');
  }

  return errors;
};

// Criação no banco
const createOrder = async (data) => {
  // se ainda não criaste tabela, apenas loga:
  console.log('📦 Nova encomenda recebida:');
  console.log(data);

  // (quando tiveres tabela "orders", podemos salvar assim)
  // const insertQuery = `
  //   INSERT INTO orders (name, business, email, services, message)
  //   VALUES ($1, $2, $3, $4, $5)
  //   RETURNING id, name, business, email, services, message, created_at
  // `;
  // const values = [data.name, data.business, data.email, data.services, data.message];
  // const { rows } = await db.query(insertQuery, values);
  // return rows[0];

  return { ...data, id: Date.now() }; // simula um registo
};

// Listagem
const listOrders = async () => {
  // Se ainda não tiveres base de dados:
  return [{ example: 'Este endpoint pode listar orders' }];
};

module.exports = { validateOrder, createOrder, listOrders };
