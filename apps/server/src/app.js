const express = require('express');
const ordersRouter = require('./routes/orders');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Minimal CORS to allow frontend dev server access
app.use((req, res, next) => {
  const origin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Order service is up and running' });
});

app.use('/orders', ordersRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Resource not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
