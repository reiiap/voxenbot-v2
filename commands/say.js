// Command /say agar bot mengirim pesan teks biasa.
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  adminCooldown: true,
  data: new SlashCommandBuilder().setName('say').setDescription('Mengirim pesan teks biasa melalui bot.').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addStringOption((option) => option.setName('message').setDescription('Isi pesan.').setRequired(true).setMaxLength(2000)),
  async execute(interaction) {
    await interaction.reply({ content: 'Pesan berhasil dikirim.', ephemeral: true });
    await interaction.channel.send(interaction.options.getString('message'));
  }
};
