const prisma = require('../prisma');

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

// Criação no banco via Prisma
const createOrder = async (data) => {
  const created = await prisma.order.create({
    data: {
      name: data.name.trim(),
      business: data.business.trim(),
      email: data.email.trim(),
      services: String(data.services),
      message: data.message || null,
    },
  });
  return created;
};

// Listagem
const listOrders = async () => {
  const list = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  return list;
};

module.exports = { validateOrder, createOrder, listOrders };
