// Business logic verification API agar route Express tetap tipis.
const config = require('../config');
const StorageService = require('./StorageService');

class VerificationService {
  constructor() { this.storage = new StorageService('./verification'); }
  async readStore() { return this.storage.readJson(config.paths.verificationStore, { requests: {}, statuses: {} }); }
  async writeStore(store) { await this.storage.writeJson(config.paths.verificationStore, store); }
  async request(player, discordId = null) {
    if (!player || typeof player !== 'string') throw new Error('player wajib diisi.');
    const store = await this.readStore();
    store.requests[player] = { player, discordId, requestedAt: new Date().toISOString(), status: store.statuses[player] || 'pending' };
    store.statuses[player] = store.statuses[player] || 'pending';
    await this.writeStore(store);
    return { player, status: store.statuses[player] };
  }
  async status(player) {
    const store = await this.readStore();
    return { player, status: store.statuses[player] || 'unknown' };
  }
}

module.exports = new VerificationService();
