const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/training', async (req, res, next) => {
  try {
    const items = await prisma.training.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const items = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
