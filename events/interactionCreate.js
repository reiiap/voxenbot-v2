// Event interactionCreate hanya meneruskan routing ke handler terkait.
const CommandHandler = require('../handlers/CommandHandler');
const ComponentHandler = require('../handlers/ComponentHandler');
const ModalHandler = require('../handlers/ModalHandler');
const AutocompleteHandler = require('../handlers/AutocompleteHandler');
const logger = require('../utils/Logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isAutocomplete()) return AutocompleteHandler.handle(interaction);
      if (interaction.isChatInputCommand()) return CommandHandler.handle(interaction);
      if (interaction.isButton() || interaction.isStringSelectMenu()) return ComponentHandler.handle(interaction);
      if (interaction.isModalSubmit()) return ModalHandler.handle(interaction);
    } catch (error) {
      logger.error('Interaction gagal diproses.', error);
      const payload = { content: `Terjadi kesalahan: ${error.message || 'Silakan coba lagi nanti.'}`, ephemeral: true, components: [] };
      if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch((followError) => logger.error('Gagal mengirim follow up error.', followError));
      else await interaction.reply(payload).catch((replyError) => logger.error('Gagal mengirim pesan error.', replyError));
    }
  }
};
