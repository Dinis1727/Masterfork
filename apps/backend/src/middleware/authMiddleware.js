const jwtUtils = require('../utils/jwt');

// Middleware para proteger rotas privadas
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwtUtils.verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }

  // Armazena o utilizador decodificado para uso posterior
  req.user = decoded;
  next();
};
