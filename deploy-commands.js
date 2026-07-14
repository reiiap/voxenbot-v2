// Registers slash commands globally, or to GUILD_ID for instant development updates.
require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const config = require('./config');

async function main() {
  const commandFiles = (await fs.readdir(path.join(__dirname, 'commands'))).filter((f) => f.endsWith('.js'));
  const commands = commandFiles.map((file) => require(path.join(__dirname, 'commands', file)).data.toJSON());
  const rest = new REST({ version: '10' }).setToken(config.token);
  if (!config.token || !config.clientId) throw new Error('DISCORD_TOKEN and CLIENT_ID are required.');
  const route = config.guildId ? Routes.applicationGuildCommands(config.clientId, config.guildId) : Routes.applicationCommands(config.clientId);
  await rest.put(route, { body: commands });
  console.log(`Registered ${commands.length} slash commands ${config.guildId ? `to guild ${config.guildId}` : 'globally'}.`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
