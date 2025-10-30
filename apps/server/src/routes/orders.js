const express = require('express');
const ordersController = require('../controllers/ordersController');

const router = express.Router();

router.post('/', ordersController.create);

module.exports = router;
