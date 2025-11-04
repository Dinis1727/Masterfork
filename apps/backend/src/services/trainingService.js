const ordersService = require('./ordersService');

const sanitise = (value) => (typeof value === 'string' ? value.trim() : '');

const validate = (data = {}) => {
  const errors = [];
  const payload = {};

  const nome = sanitise(data.nome || data.name);
  const email = sanitise(data.email);
  const formacao = sanitise(data.formacao || data.training);

  if (!nome) errors.push('Nome é obrigatório.');
  if (!email) errors.push('Email é obrigatório.');
  if (!formacao) errors.push('Área de formação é obrigatória.');

  if (!errors.length) {
    payload.nome = nome;
    payload.email = email;
    payload.formacao = formacao;
    const telefone = sanitise(data.telefone || data.phone);
    if (telefone) payload.telefone = telefone;
    const mensagem = sanitise(data.mensagem || data.message);
    if (mensagem) payload.mensagem = mensagem;
  }

  return { errors, payload };
};

const register = async (payload) => ordersService.callUpstream('POST', '/training', payload);

const list = async () => ordersService.callUpstream('GET', '/training', null);

module.exports = {
  validate,
  register,
  list,
};
