// Konfigurasi pusat bot. Semua nilai sensitif diambil dari environment variable.
require('dotenv').config();

function list(name) {
  return (process.env[name] || '').split(',').map((value) => value.trim()).filter(Boolean);
}

module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  ownerId: process.env.OWNER_ID || '',
  port: Number(process.env.PORT || 3000),
  cooldowns: {
    adminCommandSeconds: Number(process.env.ADMIN_COMMAND_COOLDOWN_SECONDS || 5)
  },
  permissions: {
    allowedRoleIds: list('ALLOWED_ROLE_IDS'),
    adminRoleIds: list('ADMIN_ROLE_IDS'),
    developerRoleIds: list('DEVELOPER_ROLE_IDS'),
    moderatorRoleIds: list('MODERATOR_ROLE_IDS')
  },
  paths: {
    embeds: './embeds',
    data: './data',
    backups: './data/backups',
    verificationStore: './verification/verification-store.json'
  }
};
