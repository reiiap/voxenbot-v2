// Handler khusus button component.
const embedCommand = require('../commands/embed');
class ButtonHandler { async handle(interaction) { if (interaction.customId.startsWith('embed:')) return embedCommand.handleComponent(interaction); } }
module.exports = new ButtonHandler();
