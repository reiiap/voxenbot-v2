// VoxenBot v2 entrypoint. Loads commands/events, starts Discord client and Express verification API.
require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const createVerificationApi = require('./verification/api');

process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));
process.on('uncaughtException', (e) => console.error('Uncaught exception:', e));

async function loadDirectory(client, dir, attach) { const files = (await fs.readdir(path.join(__dirname, dir)).catch(() => [])).filter((f) => f.endsWith('.js')); for (const file of files) attach(require(path.join(__dirname, dir, file))); }
async function main() {
  if (!config.token) throw new Error('DISCORD_TOKEN is required.');
  await Promise.all([fs.mkdir(config.paths.embeds, { recursive:true }), fs.mkdir(config.paths.data, { recursive:true }), fs.mkdir('./verification', { recursive:true })]);
  const client = new Client({ intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials:[Partials.Channel] });
  client.commands = new Collection();
  await loadDirectory(client, 'commands', (cmd) => client.commands.set(cmd.data.name, cmd));
  await loadDirectory(client, 'events', (event) => client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args)));
  createVerificationApi().listen(config.port, () => console.log(`Verification API listening on port ${config.port}`));
  await client.login(config.token);
}
main().catch((e) => { console.error('Startup failed:', e); process.exitCode = 1; });
