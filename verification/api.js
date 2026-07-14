// Route Express untuk kompatibilitas verification API lama.
const express = require('express');
const VerificationService = require('../services/VerificationService');
const logger = require('../utils/Logger');

function createVerificationApi() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', async (req, res) => {
    res.json({ ok: true, service: 'VoxenBot v2', timestamp: new Date().toISOString() });
  });

  app.post('/verification/request', async (req, res) => {
    try {
      const result = await VerificationService.request(req.body?.player, req.body?.discordId || null);
      res.json({ ok: true, status: result.status });
    } catch (error) {
      logger.error('Request verification gagal.', error);
      res.status(400).json({ ok: false, error: error.message || 'Terjadi kesalahan internal.' });
    }
  });

  app.get('/verification/status/:player', async (req, res) => {
    try {
      const result = await VerificationService.status(req.params.player);
      res.json({ ok: true, player: result.player, status: result.status });
    } catch (error) {
      logger.error('Status verification gagal.', error);
      res.status(500).json({ ok: false, error: 'Terjadi kesalahan internal.' });
    }
  });

  return app;
}

module.exports = createVerificationApi;
