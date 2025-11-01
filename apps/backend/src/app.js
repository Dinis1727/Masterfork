const http = require('node:http');

// Habilitar CORS para permitir o frontend (localhost:3000)
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

// "Base de dados" temporária (em memória)
const orders = [];

// Criar o servidor HTTP
const createApp = () => {
  const server = http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Obter todas as orders
    if (req.url === '/orders' && req.method === 'GET') {
      sendJson(res, 200, { orders });
      return;
    }

    // Criar nova encomenda
    if (req.url === '/orders' && req.method === 'POST') {
      try {
        const rawBody = await readRequestBody(req);
        const data = JSON.parse(rawBody);

        // Validação básica
        if (!data.name || !data.business || !data.email || !data.services) {
          sendJson(res, 400, { error: 'Campos obrigatórios em falta.' });
          return;
        }

        const newOrder = {
          id: orders.length + 1,
          name: data.name.trim(),
          business: data.business.trim(),
          email: data.email.trim(),
          services: data.services,
          message: data.message || '',
          createdAt: new Date().toISOString(),
        };

        orders.push(newOrder);
        sendJson(res, 201, { success: true, order: newOrder });
      } catch (error) {
        console.error('Erro ao processar encomenda:', error);
        sendJson(res, 500, { error: 'Erro interno no servidor.' });
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
