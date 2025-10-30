const { validateOrder, createOrder } = require('../services/ordersService');

const create = async (req, res, next) => {
  const errors = validateOrder(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const order = await createOrder(req.body);
    return res.status(201).json({ order });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  create,
};

