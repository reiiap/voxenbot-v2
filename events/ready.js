// Ready event logs bot identity and presence.
module.exports = { name: 'ready', once: true, async execute(client) { console.log(`VoxenBot v2 online as ${client.user.tag}`); await client.user.setActivity('/embed'); } };
