// Service permission untuk owner, admin, developer, moderator, dan role khusus.
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

class PermissionService {
  roleIds(type) { return config.permissions[type] || []; }
  memberHasRole(member, roles) { return Boolean(member?.roles?.cache && roles.some((roleId) => member.roles.cache.has(roleId))); }
  isOwner(userId) { return Boolean(config.ownerId && userId === config.ownerId); }
  isAdmin(member, userId) { return this.isOwner(userId) || Boolean(member?.permissions?.has(PermissionFlagsBits.Administrator)) || this.memberHasRole(member, config.permissions.adminRoleIds); }
  isDeveloper(member, userId) { return this.isOwner(userId) || this.memberHasRole(member, config.permissions.developerRoleIds); }
  isModerator(member, userId) { return this.isAdmin(member, userId) || this.memberHasRole(member, config.permissions.moderatorRoleIds); }
  hasAllowedRole(member, userId) { return this.isAdmin(member, userId) || this.isDeveloper(member, userId) || this.isModerator(member, userId) || this.memberHasRole(member, config.permissions.allowedRoleIds); }
  canUseEmbedManager(interaction) { return this.hasAllowedRole(interaction.member, interaction.user.id); }
  async guardEmbedManager(interaction) {
    if (this.canUseEmbedManager(interaction)) return true;
    await interaction.reply({ content: 'Anda tidak memiliki izin untuk menggunakan Embed Manager.', ephemeral: true });
    return false;
  }
}

module.exports = new PermissionService();
