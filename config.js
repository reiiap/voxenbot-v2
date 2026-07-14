// Central runtime configuration. Values come from environment variables so Railway can inject secrets safely.
require('dotenv').config();

/** Convert a comma-separated env var into a clean array of Discord snowflakes. */
function list(name) {
  return (process.env[name] || '').split(',').map((v) => v.trim()).filter(Boolean);
}

module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.CLIENT_ID || '',
  guildId: process.env.GUILD_ID || '',
  ownerId: process.env.OWNER_ID || '',
  port: Number(process.env.PORT || 3000),
  permissions: {
    allowedRoleIds: list('ALLOWED_ROLE_IDS'),
    adminRoleIds: list('ADMIN_ROLE_IDS'),
    developerRoleIds: list('DEVELOPER_ROLE_IDS'),
    moderatorRoleIds: list('MODERATOR_ROLE_IDS')
  },
  paths: {
    embeds: './embeds',
    data: './data',
    verificationStore: './verification/verification-store.json'
  }
};
