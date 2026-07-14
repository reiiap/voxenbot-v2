// Complete TicketTool-style /embed manager using modals, select menus and buttons.
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const EmbedManager = require('../utils/EmbedManager');
const PermissionManager = require('../utils/PermissionManager');

function modal(id, title, inputs) { const m = new ModalBuilder().setCustomId(id).setTitle(title); for (const i of inputs) m.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId(i.id).setLabel(i.label).setStyle(i.style || TextInputStyle.Short).setRequired(Boolean(i.required)).setValue(String(i.value || '').slice(0, i.max || 4000)).setMaxLength(i.max || 4000))); return m; }
function select(id, names) { return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(id).setPlaceholder('Choose a saved embed').addOptions(names.slice(0, 25).map((n) => ({ label: n, value: n })))); }
async function choose(interaction, action) { const names = await EmbedManager.list(); if (!names.length) return interaction.reply({ content: 'No saved embeds found.', ephemeral: true }); return interaction.reply({ content: `Select an embed to ${action}.`, components: [select(`embed:${action}`, names)], ephemeral: true }); }
function controls(name) { return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`embed:publish:${name}`).setLabel('Publish').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`embed:edit:${name}`).setLabel('Edit').setStyle(ButtonStyle.Primary)); }

module.exports = {
  data: new SlashCommandBuilder().setName('embed').setDescription('Manage reusable JSON embeds.')
    .addSubcommand((s)=>s.setName('create').setDescription('Create a new embed with the modal wizard.'))
    .addSubcommand((s)=>s.setName('edit').setDescription('Edit a saved embed.'))
    .addSubcommand((s)=>s.setName('delete').setDescription('Delete a saved embed.'))
    .addSubcommand((s)=>s.setName('send').setDescription('Send a saved embed.'))
    .addSubcommand((s)=>s.setName('preview').setDescription('Preview a saved embed privately.'))
    .addSubcommand((s)=>s.setName('list').setDescription('List saved embeds.'))
    .addSubcommand((s)=>s.setName('clone').setDescription('Clone an embed.').addStringOption((o)=>o.setName('source').setDescription('Source embed.').setAutocomplete(true).setRequired(true)).addStringOption((o)=>o.setName('name').setDescription('New embed name.').setRequired(true)))
    .addSubcommand((s)=>s.setName('export').setDescription('Export an embed JSON file.').addStringOption((o)=>o.setName('name').setDescription('Embed name.').setAutocomplete(true).setRequired(true)))
    .addSubcommand((s)=>s.setName('import').setDescription('Import an embed JSON file.').addAttachmentOption((o)=>o.setName('file').setDescription('JSON file.').setRequired(true))),
  async autocomplete(interaction) { const focused = interaction.options.getFocused().toLowerCase(); const names = await EmbedManager.list(); await interaction.respond(names.filter((n)=>n.includes(focused)).slice(0,25).map((n)=>({ name:n, value:n }))); },
  async execute(interaction) {
    if (!(await PermissionManager.guardEmbed(interaction))) return;
    const sub = interaction.options.getSubcommand();
    if (sub === 'create') return interaction.showModal(modal('embed:create:1', 'Embed Wizard 1/5', [{ id:'name', label:'Embed Name', required:true, max:64 }]));
    if (['edit','delete','send','preview'].includes(sub)) return choose(interaction, sub);
    if (sub === 'list') { const names = await EmbedManager.list(); return interaction.reply({ content: names.length ? `Saved embeds:\n${names.map((n)=>`• ${n}`).join('\n')}` : 'No saved embeds yet.', ephemeral: true }); }
    if (sub === 'clone') { const e = await EmbedManager.clone(interaction.options.getString('source'), interaction.options.getString('name')); return interaction.reply({ content: `Cloned embed as ${e.name}.`, ephemeral: true }); }
    if (sub === 'export') { const e = await EmbedManager.get(interaction.options.getString('name')); if (!e) return interaction.reply({ content:'Embed not found.', ephemeral:true }); return interaction.reply({ content:`Exported ${e.name}.`, files:[EmbedManager.attachment(e)], ephemeral:true }); }
    if (sub === 'import') { const file = interaction.options.getAttachment('file'); const res = await fetch(file.url); const json = await res.json(); const saved = await EmbedManager.save(json); return interaction.reply({ content:`Imported ${saved.name}.`, ephemeral:true }); }
  },
  async handleComponent(interaction) {
    if (!(await PermissionManager.guardEmbed(interaction))) return;
    const [, action, name] = interaction.customId.split(':');
    const picked = interaction.isStringSelectMenu() ? interaction.values[0] : name;
    const e = await EmbedManager.get(picked); if (!e) return interaction.reply({ content:'Embed not found.', ephemeral:true });
    if (action === 'send' || action === 'publish') { await interaction.channel.send(EmbedManager.build(e)); return interaction.reply({ content:`Sent ${picked}.`, ephemeral:true }); }
    if (action === 'preview') return interaction.reply({ ...EmbedManager.build(e), components:[...(EmbedManager.build(e).components), controls(picked)], ephemeral:true });
    if (action === 'edit') return interaction.showModal(modal(`embed:editmodal:${picked}`, `Edit ${picked}`, [{id:'title',label:'Title',value:e.title,max:256},{id:'description',label:'Description',value:e.description,style:TextInputStyle.Paragraph},{id:'footer',label:'Footer',value:e.footer,max:2048},{id:'color',label:'Color',value:e.color,max:16},{id:'buttons',label:'Buttons label|url per line',value:(e.buttons||[]).map((b)=>`${b.label}|${b.url}`).join('\n'),style:TextInputStyle.Paragraph}]));
    if (action === 'delete') return interaction.reply({ content:`Delete ${picked}?`, components:[new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`embed:confirmdelete:${picked}`).setLabel('Confirm Delete').setStyle(ButtonStyle.Danger))], ephemeral:true });
    if (action === 'confirmdelete') { await EmbedManager.delete(picked); return interaction.update({ content:`Deleted ${picked}.`, components:[] }); }
  },
  async handleModal(interaction) {
    const parts = interaction.customId.split(':');
    if (parts[1] === 'create') {
      const step = Number(parts[2]); const prior = JSON.parse(interaction.fields.getTextInputValue('state') || '{}');
      if (step === 1) { prior.name = interaction.fields.getTextInputValue('name'); return interaction.showModal(modal('embed:create:2','Embed Wizard 2/5',[{id:'state',label:'Do not edit state',value:JSON.stringify(prior),style:TextInputStyle.Paragraph},{id:'title',label:'Title',max:256},{id:'description',label:'Description',style:TextInputStyle.Paragraph}])); }
      if (step === 2) { prior.title=interaction.fields.getTextInputValue('title'); prior.description=interaction.fields.getTextInputValue('description'); return interaction.showModal(modal('embed:create:3','Embed Wizard 3/5',[{id:'state',label:'Do not edit state',value:JSON.stringify(prior),style:TextInputStyle.Paragraph},{id:'footer',label:'Footer'},{id:'color',label:'Color',value:'#5865F2'}])); }
      if (step === 3) { prior.footer=interaction.fields.getTextInputValue('footer'); prior.color=interaction.fields.getTextInputValue('color'); return interaction.showModal(modal('embed:create:4','Embed Wizard 4/5',[{id:'state',label:'Do not edit state',value:JSON.stringify(prior),style:TextInputStyle.Paragraph},{id:'thumbnail',label:'Thumbnail URL'},{id:'image',label:'Image URL'}])); }
      if (step === 4) { prior.thumbnail=interaction.fields.getTextInputValue('thumbnail'); prior.image=interaction.fields.getTextInputValue('image'); return interaction.showModal(modal('embed:create:5','Embed Wizard 5/5',[{id:'state',label:'Do not edit state',value:JSON.stringify(prior),style:TextInputStyle.Paragraph},{id:'buttons',label:'Up to 5 buttons: label|url per line',style:TextInputStyle.Paragraph}])); }
      prior.buttons = interaction.fields.getTextInputValue('buttons').split('\n').filter(Boolean).map((l)=>{ const [label,...url]=l.split('|'); return { label:label?.trim(), url:url.join('|').trim() }; }); const saved = await EmbedManager.save(prior); return interaction.reply({ content:`Created ${saved.name}.`, ...EmbedManager.build(saved), ephemeral:true });
    }
    if (parts[1] === 'editmodal') { const old = await EmbedManager.get(parts[2]); old.title=interaction.fields.getTextInputValue('title'); old.description=interaction.fields.getTextInputValue('description'); old.footer=interaction.fields.getTextInputValue('footer'); old.color=interaction.fields.getTextInputValue('color'); old.buttons=interaction.fields.getTextInputValue('buttons').split('\n').filter(Boolean).map((l)=>{ const [label,...url]=l.split('|'); return { label:label.trim(), url:url.join('|').trim() }; }); const saved = await EmbedManager.save(old); return interaction.reply({ content:`Updated ${saved.name}.`, ephemeral:true }); }
  }
};
