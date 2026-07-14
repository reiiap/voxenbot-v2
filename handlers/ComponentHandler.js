// Handler pengarah untuk seluruh component Discord.
const ButtonHandler = require('./ButtonHandler');
const SelectMenuHandler = require('./SelectMenuHandler');
class ComponentHandler { async handle(interaction) { if (interaction.isButton()) return ButtonHandler.handle(interaction); if (interaction.isStringSelectMenu()) return SelectMenuHandler.handle(interaction); } }
module.exports = new ComponentHandler();
