// Handler khusus modal submit.
const embedCommand = require('../commands/embed');
class ModalHandler { async handle(interaction) { if (interaction.customId.startsWith('embed:')) return embedCommand.handleModal(interaction); } }
module.exports = new ModalHandler();
