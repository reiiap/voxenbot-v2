// Handler autocomplete agar command tetap ringan.
const logger = require('../utils/Logger');

class AutocompleteHandler {
  async handle(interaction) {
    try {
      const command = interaction.client.commands.get(interaction.commandName);
      if (command?.autocomplete) await command.autocomplete(interaction);
    } catch (error) {
      logger.error('Autocomplete gagal.', error);
    }
  }
}
module.exports = new AutocompleteHandler();
