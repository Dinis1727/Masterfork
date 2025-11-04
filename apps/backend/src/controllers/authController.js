const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body || {});
    res.status(201).json({ message: 'Conta criada com sucesso', user, token });
  } catch (error) {
    if (error && error.message) {
      res.status(400).json({ error: error.message });
      return;
    }
    next(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body || {});
    res.json({ message: 'Login bem-sucedido', token, user });
  } catch (error) {
    const status = error && /credenciais|não encontrado/i.test(error.message) ? 401 : 400;
    res.status(status).json({ error: error.message || 'Falha na autenticação' });
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
  } catch (error) {
    res.status(403).json({ error: error.message || 'Token inválido ou expirado.' });
  }
};

exports.profile = async (req, res, next) => {
  try {
    const { user, token } = await authService.update(req.user.id, req.body || {});
    res.json({ message: 'Perfil atualizado com sucesso', user, token });
  } catch (error) {
    if (error && error.message) {
      const status = /não encontrado/i.test(error.message) ? 404 : 400;
      res.status(status).json({ error: error.message });
      return;
    }
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
