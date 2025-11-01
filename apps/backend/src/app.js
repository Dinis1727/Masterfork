const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');

// Habilitar CORS para permitir o frontend (localhost:3000)
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// Logger simples estruturado
const log = (level, msg, extra = {}) => {
  const payload = { level, msg, ts: new Date().toISOString(), ...extra };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
};

// Função utilitária para enviar JSON
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

// Ler o corpo do pedido
const readRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

// Base URL do serviço interno (Server 3002)
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:3002';
const RATE_LIMIT_RPM = Number.parseInt(process.env.RATE_LIMIT_RPM || '60', 10);

// Rate limiter simples por IP
const buckets = new Map();
const allowRequest = (ip) => {
  const now = Date.now();
  const windowMs = 60_000;
  const tokensPerWindow = RATE_LIMIT_RPM;
  const refillRate = tokensPerWindow / windowMs; // tokens por ms
  let b = buckets.get(ip);
  if (!b) {
    b = { tokens: tokensPerWindow, last: now };
  }
  const elapsed = now - b.last;
  b.tokens = Math.min(tokensPerWindow, b.tokens + elapsed * refillRate);
  b.last = now;
  if (b.tokens < 1) {
    buckets.set(ip, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
};

// Proxy utilitário para encaminhar pedidos ao serviço interno
const proxyRequest = (method, pathname, jsonBody) =>
  new Promise((resolve, reject) => {
    try {
      const target = new URL(SERVER_BASE_URL);
      const body = jsonBody ? JSON.stringify(jsonBody) : null;
      const isHttps = target.protocol === 'https:';
      const options = {
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path: pathname,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body ? Buffer.byteLength(body) : 0,
        },
      };

      const req = (isHttps ? https : http).request(options, (resp) => {
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ statusCode: resp.statusCode || 500, body: parsed });
          } catch (e) {
            resolve({ statusCode: resp.statusCode || 500, body: {} });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    } catch (err) {
      reject(err);
    }
  });

// Criar o servidor HTTP
const createApp = () => {
  const server = http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // IP e rate limit por IP (apenas POST críticos)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (req.method === 'POST' && (req.url === '/orders' || req.url === '/training')) {
      if (!allowRequest(String(ip))) {
        log('warn', 'Rate limit exceeded', { ip, route: req.url });
        sendJson(res, 429, { error: 'Too Many Requests' });
        return;
      }
    }

    // Obter todas as orders (proxy)
    if (req.url === '/orders' && req.method === 'GET') {
      try {
        const upstream = await proxyRequest('GET', '/orders', null);
        sendJson(res, upstream.statusCode, upstream.body);
      } catch (error) {
        console.error('Proxy GET /orders falhou:', error);
        sendJson(res, 502, { error: 'Upstream indisponível' });
      }
      return;
    }

    // Criar nova encomenda (proxy)
    if (req.url === '/orders' && req.method === 'POST') {
      try {
        const rawBody = await readRequestBody(req);
        const data = JSON.parse(rawBody || '{}');
        // Validação rápida no BFF
        if (!data.name || !data.business || !data.email || !data.services) {
          sendJson(res, 400, { error: 'Campos obrigatórios em falta.' });
          return;
        }
        const upstream = await proxyRequest('POST', '/orders', data);
        log('info', 'Proxy POST /orders', { status: upstream.statusCode, ip });
        sendJson(res, upstream.statusCode, upstream.body);
      } catch (error) {
        log('error', 'Proxy POST /orders falhou', { error: String(error), ip });
        sendJson(res, 502, { error: 'Upstream indisponível' });
      }
      return;
    }

    // Registar inscrição de formação (proxy)
    if (req.url === '/training' && req.method === 'POST') {
      try {
        const rawBody = await readRequestBody(req);
        const data = JSON.parse(rawBody || '{}');
        // Validação rápida no BFF
        const nome = (data.nome || data.name || '').trim();
        const email = (data.email || '').trim();
        const formacao = (data.formacao || data.training || '').trim();
        if (!nome || !email || !formacao) {
          sendJson(res, 400, { error: 'Campos obrigatórios em falta.' });
          return;
        }
        const upstream = await proxyRequest('POST', '/training', data);
        log('info', 'Proxy POST /training', { status: upstream.statusCode, ip });
        sendJson(res, upstream.statusCode, upstream.body);
      } catch (error) {
        log('error', 'Proxy POST /training falhou', { error: String(error), ip });
        sendJson(res, 502, { error: 'Upstream indisponível' });
      }
      return;
    }

    // Listar inscrições de formação (proxy)
    if (req.url === '/training' && req.method === 'GET') {
      try {
        const upstream = await proxyRequest('GET', '/training', null);
        log('info', 'Proxy GET /training', { status: upstream.statusCode, ip });
        sendJson(res, upstream.statusCode, upstream.body);
      } catch (error) {
        log('error', 'Proxy GET /training falhou', { error: String(error), ip });
        sendJson(res, 502, { error: 'Upstream indisponível' });
      }
      return;
    }

    // Admin proxies
    if (req.url === '/admin/orders' && req.method === 'GET') {
      try {
        const upstream = await proxyRequest('GET', '/admin/orders', null);
        log('info', 'Proxy GET /admin/orders', { status: upstream.statusCode, ip });
        sendJson(res, upstream.statusCode, upstream.body);
      } catch (error) {
        log('error', 'Proxy GET /admin/orders falhou', { error: String(error), ip });
        sendJson(res, 502, { error: 'Upstream indisponível' });
      }
      return;
    }

    if (req.url === '/admin/training' && req.method === 'GET') {
      try {
        const upstream = await proxyRequest('GET', '/admin/training', null);
        log('info', 'Proxy GET /admin/training', { status: upstream.statusCode, ip });
        sendJson(res, upstream.statusCode, upstream.body);
      } catch (error) {
        log('error', 'Proxy GET /admin/training falhou', { error: String(error), ip });
        sendJson(res, 502, { error: 'Upstream indisponível' });
      }
      return;
    }

    // Qualquer outro endpoint → 404
    sendJson(res, 404, { error: 'Not found' });
  });

  return server;
};

// Iniciar servidor
const startServer = (port = Number.parseInt(process.env.PORT || '3001', 10)) => {
  const app = createApp();
  app.listen(port, () => {
    console.log(`Masterfork API a correr em http://localhost:${port}`);
  });
  return app;
};

module.exports = { createApp, startServer };

if (require.main === module) {
  startServer();
}
