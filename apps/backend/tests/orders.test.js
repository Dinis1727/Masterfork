const { beforeEach, afterEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

describe('Orders routes (simple HTTP server)', () => {
  let server;

  beforeEach(() => {
    server = createApp();
  });

  afterEach(() => {
    if (server && server.close) server.close();
  });

  it('returns the orders list (initially empty)', async () => {
    const response = await request(server)
      .get('/orders')
      .expect(200)
      .expect('content-type', /json/);

    assert.ok(Array.isArray(response.body.orders));
    assert.equal(response.body.orders.length, 0);
  });

  it('creates a new order when payload is valid', async () => {
    const payload = {
      name: 'Ana Martins',
      business: 'Restaurante do Mar',
      email: 'ana@example.com',
      services: 'menus',
      message: 'Entregar às 20h',
    };

    const creation = await request(server)
      .post('/orders')
      .send(payload)
      .expect(201)
      .expect('content-type', /json/);

    assert.equal(creation.body.success, true);
    assert.ok(creation.body.order);
    assert.equal(creation.body.order.name, payload.name);
    assert.ok(typeof creation.body.order.id === 'number');

    const list = await request(server).get('/orders').expect(200);
    assert.equal(list.body.orders.length, 1);
    assert.equal(list.body.orders[0].name, payload.name);
  });

  it('rejects invalid orders with 400 status', async () => {
    const response = await request(server)
      .post('/orders')
      .send({ name: '', business: '', email: '', services: '' })
      .expect(400)
      .expect('content-type', /json/);

    assert.match(String(response.body.error || ''), /multa|falta|obrigat|invalid|missing/i);
  });
});
