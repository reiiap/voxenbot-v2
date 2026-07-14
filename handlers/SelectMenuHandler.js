// Handler khusus StringSelectMenu component.
const embedCommand = require('../commands/embed');
class SelectMenuHandler { async handle(interaction) { if (interaction.customId.startsWith('embed:')) return embedCommand.handleComponent(interaction); } }
module.exports = new SelectMenuHandler();
