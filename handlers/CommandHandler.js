// Handler command: load command, eksekusi, dan cooldown admin.
const fs = require('node:fs/promises');
const path = require('node:path');
const { Collection } = require('discord.js');
const CooldownService = require('../services/CooldownService');
const logger = require('../utils/Logger');

class CommandHandler {
  async load(client) {
    client.commands = new Collection();
    const commandPath = path.join(__dirname, '..', 'commands');
    const files = (await fs.readdir(commandPath).catch(() => [])).filter((file) => file.endsWith('.js'));
    for (const file of files) {
      const command = require(path.join(commandPath, file));
      client.commands.set(command.data.name, command);
    }
    logger.success(`${client.commands.size} command dimuat.`);
  }
  async handle(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    if (command.adminCooldown && !(await CooldownService.guard(interaction))) return;
    await command.execute(interaction);
  }
}
module.exports = new CommandHandler();
