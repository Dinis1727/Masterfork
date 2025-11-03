const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ message: 'Conta criada com sucesso', user, token });
  } catch (err) {
    if (err && err.message) {
      res.status(400).json({ error: err.message });
      return;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.json({ message: 'Login bem-sucedido', token, user });
  } catch (err) {
    const status = err && /credenciais/i.test(err.message) ? 401 : 400;
    res.status(status).json({ error: err.message || 'Falha na autenticação' });
  }
};

exports.verifyToken = async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Token não fornecido.' });
    return;
  }

  try {
    const user = await authService.verify(token);
    res.json({ user });
  } catch (err) {
    res.status(403).json({ error: err.message || 'Token inválido ou expirado.' });
  }
};
