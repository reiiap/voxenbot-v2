// Command /purge untuk menghapus pesan secara massal.
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  adminCooldown: true,
  data: new SlashCommandBuilder().setName('purge').setDescription('Menghapus pesan terbaru.').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addIntegerOption((option) => option.setName('amount').setDescription('Jumlah pesan yang dihapus (1-100).').setMinValue(1).setMaxValue(100).setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `Berhasil menghapus ${deleted.size} pesan.`, ephemeral: true });
  }
};
