// /ping utility command.
const { SlashCommandBuilder } = require('discord.js');
module.exports = { data: new SlashCommandBuilder().setName('ping').setDescription('Shows bot and API latency.'), async execute(interaction) { await interaction.reply(`Pong! API latency: ${interaction.client.ws.ping}ms`); } };
