// Cooldown sederhana berbasis memori untuk command admin.
const config = require('../config');

class CooldownService {
  constructor() { this.cooldowns = new Map(); }
  key(interaction) { return `${interaction.user.id}:${interaction.commandName}`; }
  check(interaction, seconds = config.cooldowns.adminCommandSeconds) {
    const now = Date.now();
    const key = this.key(interaction);
    const expiresAt = this.cooldowns.get(key) || 0;
    if (expiresAt > now) return Math.ceil((expiresAt - now) / 1000);
    this.cooldowns.set(key, now + seconds * 1000);
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
