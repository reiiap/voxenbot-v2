// Command /announce untuk mengirim pengumuman embed sederhana.
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const EmbedService = require('../services/EmbedService');

module.exports = {
  adminCooldown: true,
  data: new SlashCommandBuilder().setName('announce').setDescription('Mengirim pengumuman berbentuk embed.').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addStringOption((option) => option.setName('title').setDescription('Judul pengumuman.').setRequired(true).setMaxLength(256)).addStringOption((option) => option.setName('message').setDescription('Isi pengumuman.').setRequired(true).setMaxLength(4096)).addStringOption((option) => option.setName('color').setDescription('Warna HEX.').setAutocomplete(true)),
  async autocomplete(interaction) { await interaction.respond(['#5865F2', '#57F287', '#FEE75C', '#ED4245', '#EB459E'].map((color) => ({ name: color, value: color }))); },
  async execute(interaction) {
    const color = interaction.options.getString('color') || '#5865F2';
    if (!EmbedService.isHex(color)) return interaction.reply({ content: 'Warna harus menggunakan format HEX, contoh #5865F2.', ephemeral: true });
    const embed = new EmbedBuilder().setTitle(interaction.options.getString('title')).setDescription(interaction.options.getString('message')).setColor(color).setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
};
