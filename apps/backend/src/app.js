const express = require('express');
const authRouter = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const trainingRouter = require('./routes/training');
const ordersService = require('./services/ordersService');

const setCorsHeaders = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
};

const createApp = () => {
  const app = express();
  app.set('trust proxy', true);
  app.use(setCorsHeaders);
  app.use(express.json({ limit: '1mb' }));

  app.use('/auth', authRouter);
  app.use('/orders', ordersRouter);
  app.use('/training', trainingRouter);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Admin proxies remain available for tooling
  app.get('/admin/orders', async (req, res, next) => {
    try {
      const data = await ordersService.callUpstream('GET', '/admin/orders', null, req.headers.authorization);
      res.json(data);
    } catch (error) {
      if (error && error.status) {
        res.status(error.status).json({ error: error.message, details: error.details });
        return;
      }
      next(error);
    }
  });

  app.get('/admin/training', async (req, res, next) => {
    try {
      const data = await ordersService.callUpstream('GET', '/admin/training', null, req.headers.authorization);
      res.json(data);
    } catch (error) {
      if (error && error.status) {
        res.status(error.status).json({ error: error.message, details: error.details });
        return;
      }
      next(error);
    }
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    console.error('Erro inesperado:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  });

  return app;
};

const startServer = (port = Number.parseInt(process.env.PORT || '3001', 10)) => {
  const app = createApp();
  const server = app.listen(port, () => {
    console.info(`Masterfork API a correr em http://localhost:${port}`);
  });
  return server;
};

module.exports = { createApp, startServer };
