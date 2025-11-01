const { validateOrder, createOrder, listOrders } = require('../services/ordersService');

const create = async (req, res, next) => {
  const errors = validateOrder(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const order = await createOrder(req.body);
    return res.status(201).json({
      message: 'Pedido recebido com sucesso!',
      order,
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const orders = await listOrders();
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
};

module.exports = { create, list };
