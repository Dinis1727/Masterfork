const express = require('express');
const ordersController = require('../controllers/ordersController');
const { authenticate } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const orderRateLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

router.use(authenticate);
router.get('/', ordersController.list);
router.post('/', orderRateLimiter, ordersController.create);

module.exports = router;
