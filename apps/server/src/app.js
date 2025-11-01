const express = require('express');
const ordersRouter = require('./routes/orders');
const trainingRouter = require('./routes/training');
const adminRouter = require('./routes/admin');
const db = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS desativado neste serviço (ficará atrás do BFF)

app.get('/', (req, res) => {
  res.json({ message: 'Order service is up and running' });
});

app.use('/orders', ordersRouter);
app.use('/training', trainingRouter);
app.use('/admin', adminRouter);

// DB health check
app.get('/health/db', async (req, res) => {
  try {
    const r = await db.query('SELECT 1 as ok');
    res.json({ ok: true, result: r.rows?.[0]?.ok === 1 });
  } catch (err) {
    console.error('DB health check failed:', err);
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
