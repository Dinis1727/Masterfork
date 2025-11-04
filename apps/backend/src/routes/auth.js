const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const exportedAuth = typeof authMiddleware === 'function' ? { authenticate: authMiddleware } : authMiddleware;

const authenticate = (() => {
  if (exportedAuth && typeof exportedAuth.authenticate === 'function') {
    return exportedAuth.authenticate.bind(exportedAuth);
  }
  throw new Error(`Auth middleware inválido: ${JSON.stringify(exportedAuth)}`);
})();

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', authenticate, authController.profile);
router.get('/me', authenticate, authController.me);

module.exports = router;
