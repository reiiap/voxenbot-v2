// /say plain message command.
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = { data: new SlashCommandBuilder().setName('say').setDescription('Send a plain bot message.').setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages).addStringOption((o) => o.setName('message').setDescription('Message text.').setRequired(true)), async execute(interaction) { await interaction.reply({ content: 'Message sent.', ephemeral: true }); await interaction.channel.send(interaction.options.getString('message')); } };
