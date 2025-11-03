const { beforeEach, afterEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const request = require('supertest');

// Helper: start a fake upstream server the BFF will proxy to
const startUpstream = () => {
  const calls = [];
  const upstream = http.createServer(async (req, res) => {
    calls.push({ method: req.method, url: req.url });
    let body = '';
    req.on('data', (c) => (body += c));
    await new Promise((r) => req.on('end', r));
    const json = body ? JSON.parse(body) : {};

    if (req.method === 'GET' && req.url === '/orders') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ orders: [{ id: 1, name: 'Seed' }] }));
      return;
    }
    if (req.method === 'POST' && req.url === '/orders') {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, order: { id: 123, ...json } }));
      return;
    }
    if (req.method === 'POST' && req.url === '/training') {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, registration: { id: 99, ...json } }));
      return;
    }
    if (req.method === 'GET' && req.url === '/training') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ items: [{ id: 1, email: 'test@example.com' }] }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });

  return new Promise((resolve) => {
    upstream.listen(0, () => {
      const { port } = upstream.address();
      resolve({ upstream, calls, url: `http://127.0.0.1:${port}` });
    });
  });
};

describe('BFF proxy routes', () => {
  let server;
  let upstream;
  let calls;
  let authHeader;

  beforeEach(async () => {
    const up = await startUpstream();
    upstream = up.upstream;
    calls = up.calls;
    process.env.SERVER_BASE_URL = up.url; // set before requiring app
    // Require after setting env so module picks it up
    delete require.cache[require.resolve('../src/services/authService')];
    delete require.cache[require.resolve('../src/app')];
    const { createApp } = require('../src/app');
    server = createApp();

    const authService = require('../src/services/authService');
    if (authService && typeof authService.__resetForTests === 'function') {
      authService.__resetForTests();
    }

    await request(server)
      .post('/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'secret123' })
      .expect(201);
    const login = await request(server)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'secret123' })
      .expect(200)
      .expect('content-type', /json/);
    assert.ok(login.body.token);
    authHeader = { Authorization: `Bearer ${login.body.token}` };
  });

  afterEach(() => {
    if (server && server.close) server.close();
    if (upstream && upstream.close) upstream.close();
    delete process.env.SERVER_BASE_URL;
  });

  it('proxies GET /orders to upstream and returns its payload', async () => {
    const res = await request(server)
      .get('/orders')
      .set(authHeader)
      .expect(200)
      .expect('content-type', /json/);
    assert.ok(Array.isArray(res.body.orders));
    assert.equal(res.body.orders[0].name, 'Seed');
    assert.ok(calls.find((c) => c.method === 'GET' && c.url === '/orders'));
  });

  it('proxies POST /orders with valid payload', async () => {
    const payload = {
      name: 'Ana Martins',
      business: '',
      email: 'ana@example.com',
      message: 'Resumo da encomenda:\nItem x1 = €4.00\nTotal: €4.00',
      items: [{ id: 'beer', name: 'Masterbeer IPA', qty: 1, price: 4, lineTotal: 4, image: '/beer.png' }],
    };
    const res = await request(server)
      .post('/orders')
      .set(authHeader)
      .send(payload)
      .expect(201)
      .expect('content-type', /json/);
    assert.equal(res.body.success, true);
    assert.equal(res.body.order.name, 'Ana Martins');
    assert.ok(calls.find((c) => c.method === 'POST' && c.url === '/orders'));
  });

  it('rejects invalid orders with 400 before proxying', async () => {
    const res = await request(server)
      .post('/orders')
      .set(authHeader)
      .send({ name: '', email: '' })
      .expect(400)
      .expect('content-type', /json/);
    assert.match(String(res.body.error || ''), /nome e email/i);
  });

  it('blocks unauthenticated access to orders', async () => {
    await request(server).get('/orders').expect(401).expect('content-type', /json/);
    await request(server).post('/orders').send({}).expect(401).expect('content-type', /json/);
  });

  it('proxies POST /training with valid payload and GET /training list', async () => {
    const payload = { nome: 'Dinis', email: 'd@example.com', formacao: 'mesa' };
    const created = await request(server).post('/training').send(payload).expect(201).expect('content-type', /json/);
    assert.equal(created.body.success, true);
    assert.equal(created.body.registration.email, 'd@example.com');

    const list = await request(server).get('/training').expect(200).expect('content-type', /json/);
    assert.ok(Array.isArray(list.body.items));
    assert.ok(calls.find((c) => c.method === 'GET' && c.url === '/training'));
  });
});
