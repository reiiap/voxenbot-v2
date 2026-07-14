// Express verification compatibility API backed by verification-store.json.
const express = require('express');
const JsonStorage = require('../utils/JsonStorage');
const config = require('../config');
const storage = new JsonStorage('./verification');

async function readStore() { return storage.readFile(config.paths.verificationStore, { requests: {}, statuses: {} }); }
async function writeStore(data) { await storage.writeFile(config.paths.verificationStore, data); }
function createVerificationApi() {
  const app = express(); app.use(express.json({ limit: '1mb' }));
  app.post('/verification/request', async (req, res) => { try { const { player, discordId } = req.body || {}; if (!player) return res.status(400).json({ ok:false, error:'player is required' }); const store = await readStore(); store.requests[player] = { player, discordId: discordId || null, requestedAt: new Date().toISOString(), status:'pending' }; store.statuses[player] = store.statuses[player] || 'pending'; await writeStore(store); res.json({ ok:true, status:store.statuses[player] }); } catch (e) { console.error(e); res.status(500).json({ ok:false, error:'internal error' }); } });
  app.get('/verification/status/:player', async (req, res) => { try { const store = await readStore(); res.json({ ok:true, player:req.params.player, status:store.statuses[req.params.player] || 'unknown' }); } catch (e) { console.error(e); res.status(500).json({ ok:false, error:'internal error' }); } });
  return app;
}
module.exports = createVerificationApi;
