// Script register slash command untuk guild atau global.
require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const config = require('./config');
const logger = require('./utils/Logger');

async function main() {
  if (!config.token || !config.clientId) throw new Error('DISCORD_TOKEN dan CLIENT_ID wajib diisi.');
  const commandFiles = (await fs.readdir(path.join(__dirname, 'commands'))).filter((file) => file.endsWith('.js'));
  const commands = commandFiles.map((file) => require(path.join(__dirname, 'commands', file)).data.toJSON());
  const rest = new REST({ version: '10' }).setToken(config.token);
  const route = config.guildId ? Routes.applicationGuildCommands(config.clientId, config.guildId) : Routes.applicationCommands(config.clientId);
  await rest.put(route, { body: commands });
  logger.success(`${commands.length} slash command berhasil didaftarkan ${config.guildId ? `ke guild ${config.guildId}` : 'secara global'}.`);
}

main().catch((error) => {
  logger.error('Deploy command gagal.', error);
  process.exitCode = 1;
});
