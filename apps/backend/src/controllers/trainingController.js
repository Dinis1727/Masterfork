const trainingService = require('../services/trainingService');

exports.list = async (req, res, next) => {
  try {
    const data = await trainingService.list();
    res.json(data);
  } catch (error) {
    if (error && error.status) {
      res.status(error.status).json({ error: error.message, details: error.details });
      return;
    }
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { errors, payload } = trainingService.validate(req.body || {});
    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(' ') });
      return;
    }

    const data = await trainingService.register(payload);
    res.status(201).json(data);
  } catch (error) {
    if (error && error.status) {
      res.status(error.status).json({ error: error.message, details: error.details });
      return;
    }
    next(error);
  }
};
