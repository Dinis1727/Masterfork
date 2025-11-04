const express = require('express');
const trainingController = require('../controllers/trainingController');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const trainingRateLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

router.get('/', trainingController.list);
router.post('/', trainingRateLimiter, trainingController.register);

module.exports = router;
