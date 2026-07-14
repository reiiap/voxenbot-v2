// Cooldown sederhana berbasis memori untuk command admin dengan pembersihan otomatis.
const config = require('../config');

class CooldownService {
  constructor() {
    this.cooldowns = new Map();
    this.maxEntries = 5000;
  }

  key(interaction) { return `${interaction.user.id}:${interaction.commandName}`; }

  cleanup(now = Date.now()) {
    for (const [key, expiresAt] of this.cooldowns.entries()) {
      if (expiresAt <= now) this.cooldowns.delete(key);
    }
    if (this.cooldowns.size > this.maxEntries) {
      for (const key of this.cooldowns.keys()) {
        this.cooldowns.delete(key);
        if (this.cooldowns.size <= this.maxEntries) break;
      }
    }
  }

  check(interaction, seconds = config.cooldowns.adminCommandSeconds) {
    const now = Date.now();
    this.cleanup(now);
    const key = this.key(interaction);
    const expiresAt = this.cooldowns.get(key) || 0;
    if (expiresAt > now) return Math.ceil((expiresAt - now) / 1000);
    this.cooldowns.set(key, now + Math.max(0, seconds) * 1000);
    return 0;
  }

  async guard(interaction, seconds) {
    const remaining = this.check(interaction, seconds);
    if (!remaining) return true;
    await interaction.reply({ content: `Tunggu ${remaining} detik sebelum menggunakan command ini lagi.`, ephemeral: true });
    return false;
  }
}

module.exports = new CooldownService();
