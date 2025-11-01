const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const nome = (req.body?.nome || req.body?.name || '').trim();
    const email = (req.body?.email || '').trim();
    const formacao = (req.body?.formacao || req.body?.training || '').trim();

    if (!nome || !email || !formacao) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
    }

    if (!prisma?.training?.create) {
      // Ajuda para diagnosticar falta de geração do Prisma Client / migração
      return res.status(500).json({
        error: 'Prisma Client não está gerado ou o modelo TrainingRegistration não existe.',
        hint: 'Corre `npm --prefix apps/server run prisma:migrate` e `npm --prefix apps/server run prisma:generate`, depois reinicia o server (3002).',
      });
    }

    // Log simples para troubleshooting
    // eslint-disable-next-line no-console
    console.info('📚 Nova inscrição de formação:', { nome, email, formacao });

    const registration = await prisma.training.create({
      data: { nome, email, formacao },
    });

    return res.status(201).json({ success: true, registration });
  } catch (err) {
    return next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    if (!prisma?.training?.findMany) {
      return res.status(500).json({
        error: 'Prisma Client não está gerado ou o modelo Training não existe.',
        hint: 'Corre `npm --prefix apps/server run prisma:migrate` e `npm --prefix apps/server run prisma:generate`, depois reinicia o server (3002).',
      });
    }
    const items = await prisma.training.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
