const { beforeEach, describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp, getInitialOrders } = require('../src/app');

describe('Orders routes', () => {
  let app;

  beforeEach(() => {
    app = createApp(getInitialOrders());
  });

  it('returns the existing orders list', async () => {
    const response = await request(app)
      .get('/orders')
      .expect(200)
      .expect('content-type', /json/);

    assert.ok(Array.isArray(response.body.orders));
    assert.equal(response.body.orders.length, getInitialOrders().length);
    assert.equal(response.body.orders[0].customer, getInitialOrders()[0].customer);
  });

  it('creates a new order when payload is valid', async () => {
    const payload = {
      customer: 'Ana Martins',
      items: [
        { name: 'Caldo Verde', quantity: 1, price: 3.5 },
        { name: 'Bacalhau à Brás', quantity: 2, price: 12 },
      ],
      notes: 'Entregar às 20h',
    };

    const creation = await request(app)
      .post('/orders')
      .send(payload)
      .expect(201)
      .expect('content-type', /json/);

    assert.equal(creation.body.customer, 'Ana Martins');
    assert.equal(creation.body.items.length, payload.items.length);
    assert.ok(typeof creation.body.id === 'number');
    assert.equal(creation.body.status, 'pending');

    const list = await request(app).get('/orders').expect(200);
    assert.equal(list.body.orders.length, getInitialOrders().length + 1);
    assert.equal(
      list.body.orders[list.body.orders.length - 1].customer,
      'Ana Martins',
    );
  });

  it('rejects invalid orders with 400 status', async () => {
    const response = await request(app)
      .post('/orders')
      .send({ customer: '', items: [] })
      .expect(400)
      .expect('content-type', /json/);

    assert.match(response.body.error, /invalid order data/i);
  });
});
