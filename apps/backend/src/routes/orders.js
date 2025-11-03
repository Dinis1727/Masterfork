const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, ordersController.list);
router.post('/', authenticate, ordersController.create);

module.exports = router;
