// Command /ping untuk menampilkan latency API Discord.
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Menampilkan latency bot.'),
  async execute(interaction) { await interaction.reply(`Bot aktif! Latency API: ${interaction.client.ws.ping}ms`); }
};
