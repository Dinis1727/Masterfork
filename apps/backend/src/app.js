const http = require('node:http');
const https = require('node:https');
const { URL } = require('node:url');
const authService = require('./services/authService');
const jwtUtils = require('./utils/jwt');

// Habilitar CORS para permitir o frontend (localhost:3000)
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

const parseJsonBody = async (req) => {
  try {
    const raw = await readRequestBody(req);
    if (!raw) return { ok: true, data: {} };
    const data = JSON.parse(raw);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
};

const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const [scheme, token] = authHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
};

const requireAuth = async (req, res) => {
  const token = extractBearerToken(req);
  if (!token) {
    sendJson(res, 401, { error: 'Token de autenticação não fornecido.' });
    return null;
  }

  try {
    const decoded = await authService.verify(token);
    req.user = decoded;
    return { token, user: decoded };
  } catch (error) {
    const message = error?.message || 'Token inválido ou expirado.';
    const status = /não encontrado/i.test(message) ? 404 : 403;
    sendJson(res, status, { error: message });
    return null;
  }
};

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
const proxyRequest = (method, pathname, jsonBody, extraHeaders = {}) =>
  new Promise((resolve, reject) => {
    try {
      const target = new URL(SERVER_BASE_URL);
      const body = jsonBody ? JSON.stringify(jsonBody) : null;
      const isHttps = target.protocol === 'https:';
      const headers = {
        'Content-Type': 'application/json',
        ...extraHeaders,
      };
      Object.keys(headers).forEach((key) => {
        if (typeof headers[key] === 'undefined') delete headers[key];
      });
      if (body) {
        headers['Content-Length'] = Buffer.byteLength(body);
      }
      const options = {
        hostname: target.hostname,
        port: target.port || (isHttps ? 443 : 80),
        path: pathname,
        method,
        headers,
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

    if (req.url === '/auth/register' && req.method === 'POST') {
      const parsed = await parseJsonBody(req);
      if (!parsed.ok) {
        sendJson(res, 400, { error: 'JSON inválido.' });
        return;
      }
      try {
        const { user, token } = await authService.register(parsed.data);
        sendJson(res, 201, { message: 'Conta criada com sucesso', user, token });
      } catch (error) {
        sendJson(res, 400, { error: error.message || 'Não foi possível criar a conta.' });
      }
      return;
    }

    if (req.url === '/auth/login' && req.method === 'POST') {
      const parsed = await parseJsonBody(req);
      if (!parsed.ok) {
        sendJson(res, 400, { error: 'JSON inválido.' });
        return;
      }
      try {
        const { token, user } = await authService.login(parsed.data);
        sendJson(res, 200, { message: 'Login bem-sucedido', token, user });
      } catch (error) {
        const status = /credenciais/i.test(error.message || '') ? 401 : 400;
        sendJson(res, status, { error: error.message || 'Falha na autenticação.' });
      }
      return;
    }

    if (req.url === '/auth/profile' && req.method === 'PUT') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      const parsed = await parseJsonBody(req);
      if (!parsed.ok) {
        sendJson(res, 400, { error: 'JSON inválido.' });
        return;
      }
      try {
        const { user: updatedUser, token } = await authService.update(auth.user.id, parsed.data || {});
        sendJson(res, 200, { message: 'Perfil atualizado com sucesso', user: updatedUser, token });
      } catch (error) {
        const message = error?.message || 'Não foi possível atualizar o perfil.';
        const status = /não encontrado/i.test(message) ? 404 : 400;
        sendJson(res, status, { error: message });
      }
      return;
    }

    if (req.url === '/auth/me' && req.method === 'GET') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      sendJson(res, 200, { user: auth.user });
      return;
    }

    // Obter todas as orders (proxy)
    if (req.url === '/orders' && req.method === 'GET') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      try {
        const upstream = await proxyRequest('GET', '/orders', null, {
          Authorization: req.headers.authorization,
        });
        sendJson(res, upstream.statusCode, upstream.body);
      } catch (error) {
        console.error('Proxy GET /orders falhou:', error);
        sendJson(res, 502, { error: 'Upstream indisponível' });
      }
      return;
    }

    // Criar nova encomenda (proxy)
    if (req.url === '/orders' && req.method === 'POST') {
      const auth = await requireAuth(req, res);
      if (!auth) return;
      try {
        const parsed = await parseJsonBody(req);
        if (!parsed.ok) {
          sendJson(res, 400, { error: 'JSON inválido.' });
          return;
        }

        const data = parsed.data;
        const sanitise = (value) => (typeof value === 'string' ? value.trim() : '');

        const name = sanitise(data.name);
        const email = sanitise(data.email);
        if (!name || !email) {
          sendJson(res, 400, { error: 'Nome e email são obrigatórios.' });
          return;
        }

        const payload = {
          name,
          email,
        };

        const business = sanitise(data.business);
        if (business) payload.business = business;

        const services = sanitise(data.services);
        if (services) {
          payload.services = services;
        }

        const message = sanitise(data.message);
        if (message) payload.message = message;

        const summary = sanitise(data.cartSummary);
        if (summary) payload.cartSummary = summary;

        if (Array.isArray(data.items)) {
          payload.items = data.items
            .map((item) => {
              if (!item || typeof item !== 'object') return null;
              const itemId = sanitise(item.id) || undefined;
              const nameEntry = sanitise(item.name) || undefined;
              const qty = Number(item.qty);
              const price = Number(item.price);
              const lineTotal = Number(item.lineTotal);
              const image = sanitise(item.image) || undefined;

              if (!nameEntry || !Number.isFinite(qty) || qty <= 0) return null;

              const result = {
                name: nameEntry,
                qty,
              };
              if (itemId) result.id = itemId;
              if (Number.isFinite(price)) result.price = price;
              if (Number.isFinite(lineTotal)) result.lineTotal = lineTotal;
              if (image) result.image = image;
              return result;
            })
            .filter(Boolean);
          if (payload.items.length === 0) delete payload.items;
        }
        if (!payload.services) {
          payload.services = 'Loja Online';
        }

        const upstream = await proxyRequest('POST', '/orders', payload, {
          Authorization: req.headers.authorization,
        });
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
