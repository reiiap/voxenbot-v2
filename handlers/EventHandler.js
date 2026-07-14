// Handler event: load otomatis dari folder events agar scalable untuk banyak event.
const fs = require('node:fs/promises');
const path = require('node:path');
const logger = require('../utils/Logger');

class EventHandler {
  async load(client) {
    const eventPath = path.join(__dirname, '..', 'events');
    const files = (await fs.readdir(eventPath).catch(() => [])).filter((file) => file.endsWith('.js'));
    for (const file of files) {
      const event = require(path.join(eventPath, file));
      client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args));
    }
    logger.success(`${files.length} event dimuat.`);
  }
}
module.exports = new EventHandler();
