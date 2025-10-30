const http = require('node:http');

const getInitialOrders = () => [
  {
    id: 1,
    customer: 'Maria Silva',
    items: [
      { name: 'Francesinha', quantity: 2, price: 11.5 },
      { name: 'Limonada', quantity: 2, price: 2.5 },
    ],
    status: 'pending',
    notes: 'Adicionar picante extra',
  },
  {
    id: 2,
    customer: 'João Costa',
    items: [
      { name: 'Bifana', quantity: 3, price: 4.2 },
    ],
    status: 'confirmed',
    notes: '',
  },
];

const cloneOrders = initialOrders =>
  initialOrders.map(order => ({
    ...order,
    items: order.items.map(item => ({ ...item })),
  }));

const calculateTotal = items =>
  items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

const readRequestBody = req =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const isValidItem = item =>
  item &&
  typeof item.name === 'string' &&
  item.name.trim().length > 0 &&
  Number.isInteger(item.quantity) &&
  item.quantity > 0 &&
  (typeof item.price === 'number' ? item.price >= 0 : true);

const isValidOrderPayload = payload =>
  payload &&
  typeof payload.customer === 'string' &&
  payload.customer.trim().length > 0 &&
  Array.isArray(payload.items) &&
  payload.items.length > 0 &&
  payload.items.every(isValidItem);

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(data));
};

const createApp = (initialOrders = getInitialOrders()) => {
  const orders = cloneOrders(initialOrders);

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (url.pathname === '/orders' && req.method === 'GET') {
      sendJson(res, 200, { orders });
      return;
    }

    if (url.pathname === '/orders' && req.method === 'POST') {
      let payload;

      try {
        const rawBody = await readRequestBody(req);
        payload = rawBody ? JSON.parse(rawBody) : {};
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid JSON payload' });
        return;
      }

      if (!isValidOrderPayload(payload)) {
        sendJson(res, 400, { error: 'Invalid order data' });
        return;
      }

      const nextId = orders.length
        ? Math.max(...orders.map(order => order.id || 0)) + 1
        : 1;

      const sanitizedItems = payload.items.map(item => ({
        name: item.name.trim(),
        quantity: item.quantity,
        price: item.price,
      }));

      const newOrder = {
        id: nextId,
        customer: payload.customer.trim(),
        items: sanitizedItems,
        status: payload.status || 'pending',
        notes: payload.notes || '',
      };

      newOrder.total =
        typeof payload.total === 'number'
          ? payload.total
          : Number.parseFloat(calculateTotal(sanitizedItems).toFixed(2));
      newOrder.createdAt = new Date().toISOString();

      orders.push(newOrder);
      sendJson(res, 201, newOrder);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  });

  return server;
};

const startServer = (port = Number.parseInt(process.env.PORT || '3001', 10)) => {
  const app = createApp();
  app.listen(port, () => {
    console.log(`Masterfork API listening on port ${port}`);
  });
  return app;
};

module.exports = {
  createApp,
  startServer,
  getInitialOrders,
};
