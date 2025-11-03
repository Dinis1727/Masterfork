const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3002';

const isObject = (value) => value && typeof value === 'object';
const sanitise = (value) => (typeof value === 'string' ? value.trim() : '');
const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const upstreamRequest = (method, pathname, payload, authHeader) =>
  new Promise((resolve, reject) => {
    try {
      const target = new URL(pathname, SERVER_BASE_URL);
      const isHttps = target.protocol === 'https:';
      const body = payload ? JSON.stringify(payload) : null;
      const headers = {
        'Content-Type': 'application/json',
      };
      if (authHeader) headers.Authorization = authHeader;
      if (body) headers['Content-Length'] = Buffer.byteLength(body);

      const options = {
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path: `${target.pathname}${target.search}`,
        method,
        headers,
      };

      const requestFn = isHttps ? https.request : http.request;
      const req = requestFn(options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
          let json = {};
          if (data) {
            try {
              json = JSON.parse(data);
            } catch (error) {
              json = {};
            }
          }
          if (resp.statusCode >= 200 && resp.statusCode < 300) {
            resolve(json);
            return;
          }
          const err = new Error(json.error || `Upstream request failed (${resp.statusCode})`);
          err.status = resp.statusCode;
          err.details = json;
          reject(err);
        });
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    } catch (error) {
      reject(error);
    }
  });

const normaliseItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((raw) => {
      if (!isObject(raw)) return null;
      const name = sanitise(raw.name);
      const qty = toNumber(raw.qty);
      if (!name || !qty || qty <= 0) return null;
      const price = toNumber(raw.price);
      const lineTotal = toNumber(raw.lineTotal);
      const item = {
        name,
        qty,
      };
      const id = sanitise(raw.id);
      if (id) item.id = id;
      if (price !== null) item.price = price;
      if (lineTotal !== null) item.lineTotal = lineTotal;
      const image = sanitise(raw.image);
      if (image) item.image = image;
      return item;
    })
    .filter(Boolean);
};

const validateOrderPayload = (data = {}) => {
  const errors = [];
  const payload = {};

  const name = sanitise(data.name);
  if (!name) {
    errors.push('Nome é obrigatório.');
  } else {
    payload.name = name;
  }

  const email = sanitise(data.email);
  if (!email) {
    errors.push('Email é obrigatório.');
  } else {
    payload.email = email;
  }

  const business = sanitise(data.business);
  if (business) payload.business = business;

  const services = sanitise(data.services);
  if (services) payload.services = services;

  const message = sanitise(data.message);
  if (message) payload.message = message;

  const cartSummary = sanitise(data.cartSummary);
  if (cartSummary) payload.cartSummary = cartSummary;

  const items = normaliseItems(data.items);
  if (items.length > 0) payload.items = items;

  const total = toNumber(data.total);
  if (total !== null && total >= 0) payload.total = total;

  return { errors, payload };
};

const listOrders = async (authHeader) => upstreamRequest('GET', '/orders', null, authHeader);

const createOrder = async (payload, authHeader) =>
  upstreamRequest('POST', '/orders', payload, authHeader);

module.exports = {
  listOrders,
  createOrder,
  validateOrderPayload,
};
