const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.get('/', ordersController.list);
router.post('/', ordersController.create);

module.exports = router;
