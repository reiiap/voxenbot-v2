// Entrypoint VoxenBot v2: inisialisasi service, handler, Discord client, dan API Express.
require('dotenv').config();
const fs = require('node:fs/promises');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const logger = require('./utils/Logger');
const EmbedService = require('./services/EmbedService');
const CommandHandler = require('./handlers/CommandHandler');
const EventHandler = require('./handlers/EventHandler');
const createVerificationApi = require('./verification/api');

process.on('unhandledRejection', (error) => logger.error('Unhandled Promise Rejection dicegah.', error));
process.on('uncaughtException', (error) => logger.error('Uncaught Exception dicegah.', error));
process.on('warning', (warning) => logger.warn('Node warning:', warning.message));

async function ensureFolders() {
  await Promise.all([
    fs.mkdir(config.paths.embeds, { recursive: true }),
    fs.mkdir(config.paths.data, { recursive: true }),
    fs.mkdir(config.paths.backups, { recursive: true }),
    fs.mkdir('./verification', { recursive: true })
  ]);
}

async function main() {
  if (!config.token) throw new Error('DISCORD_TOKEN wajib diisi.');
  await ensureFolders();
  await EmbedService.loadCache();

  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel] });
  await CommandHandler.load(client);
  await EventHandler.load(client);

  const server = createVerificationApi().listen(config.port, () => logger.success(`Verification API berjalan pada port ${config.port}.`));
  server.on('error', (error) => logger.error('Verification API gagal berjalan.', error));
  await client.login(config.token);
}

main().catch((error) => {
  logger.error('Startup bot gagal.', error);
  process.exitCode = 1;
});
