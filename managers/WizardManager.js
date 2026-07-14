// Manager session sementara untuk Embed Wizard agar flow modal kompatibel dengan Discord API.
const crypto = require('node:crypto');
const logger = require('../utils/Logger');

class WizardManager {
  constructor() {
    this.sessions = new Map();
    this.ttlMs = 15 * 60 * 1000;
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  create({ userId, guildId, channelId, embedData = {} }) {
    this.cleanupExpired();
    const id = crypto.randomUUID();
    const now = Date.now();
    const session = { id, userId, guildId, channelId, step: 1, embedData, createdAt: now };
    this.sessions.set(id, session);
    return session;
  }

  get(id) {
    const session = this.sessions.get(id);
    if (!session) return null;
    if (Date.now() - session.createdAt > this.ttlMs) {
      this.sessions.delete(id);
      return null;
    }
    return session;
  }

  update(id, patch) {
    const session = this.get(id);
    if (!session) return null;
    const updated = { ...session, ...patch, embedData: { ...session.embedData, ...(patch.embedData || {}) } };
    this.sessions.set(id, updated);
    return updated;
  }

  delete(id) { return this.sessions.delete(id); }

  cleanupExpired() {
    const now = Date.now();
    let removed = 0;
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.createdAt > this.ttlMs) {
        this.sessions.delete(id);
        removed += 1;
      }
    }
    if (removed > 0) logger.debug(`${removed} session Embed Wizard kedaluwarsa dibersihkan.`);
  }

  size() {
    this.cleanupExpired();
    return this.sessions.size;
  }
}

module.exports = new WizardManager();
