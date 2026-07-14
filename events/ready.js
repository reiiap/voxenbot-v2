// Event ready menampilkan ringkasan status bot saat online.
const EmbedService = require('../services/EmbedService');
const logger = require('../utils/Logger');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    await client.user.setActivity('/embed');
    const guildCount = client.guilds.cache.size;
    const userCount = client.guilds.cache.reduce((total, guild) => total + (guild.memberCount || 0), 0);
    const commandCount = client.commands?.size || 0;
    const embedCount = EmbedService.listNames().length;
    const ram = `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`;
    logger.success(`
━━━━━━━━━━━━━━━━━━━━━━
VoxenBot v2
Bot     : ${client.user.tag}
Guild   : ${guildCount}
User    : ${userCount}
Command : ${commandCount}
Embed   : ${embedCount}
RAM     : ${ram}
Node    : ${process.version}
Ping    : ${client.ws.ping}ms
━━━━━━━━━━━━━━━━━━━━━━`);
  }
};
