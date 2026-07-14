// Centralized Discord permission helpers for owner and configured staff roles.
const { PermissionFlagsBits } = require('discord.js');
const config = require('../config');

class PermissionManager {
  static roleIds() { return [...config.permissions.allowedRoleIds, ...config.permissions.adminRoleIds, ...config.permissions.developerRoleIds, ...config.permissions.moderatorRoleIds]; }
  static canUseEmbedManager(member, userId) {
    if (userId === config.ownerId) return true;
    if (!member) return false;
    if (member.permissions?.has(PermissionFlagsBits.Administrator)) return true;
    return this.roleIds().some((id) => member.roles.cache.has(id));
  }
  static async guardEmbed(interaction) {
    if (this.canUseEmbedManager(interaction.member, interaction.user.id)) return true;
    await interaction.reply({ content: 'You do not have permission to use the Embed Manager.', ephemeral: true });
    return false;
  }
}
module.exports = PermissionManager;
