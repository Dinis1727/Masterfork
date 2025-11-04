const ordersService = require('../services/ordersService');

exports.list = async (req, res, next) => {
  try {
    const data = await ordersService.listOrders(req.headers.authorization);
    res.json(data);
  } catch (error) {
    if (error && error.status) {
      res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
      return;
    }
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { errors, payload } = ordersService.validateOrderPayload(req.body || {});

    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(' ') });
      return;
    }

    const data = await ordersService.createOrder(payload, req.headers.authorization);
    res.status(201).json(data);
  } catch (error) {
    if (error && error.status) {
      res.status(error.status).json({
        error: error.message,
        details: error.details,
      });
      return;
    }
    next(error);
  }
};
