// Command /embed: UI Discord untuk Embed Manager, semua business logic memakai EmbedService.
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const EmbedService = require('../services/EmbedService');
const PermissionService = require('../services/PermissionService');

function createInput(input) {
  const builder = new TextInputBuilder().setCustomId(input.id).setLabel(input.label).setStyle(input.style || TextInputStyle.Short).setRequired(Boolean(input.required)).setMaxLength(input.max || 4000);
  if (input.value) builder.setValue(String(input.value).slice(0, input.max || 4000));
  return new ActionRowBuilder().addComponents(builder);
}
function createModal(id, title, inputs) { return new ModalBuilder().setCustomId(id).setTitle(title).addComponents(inputs.map(createInput)); }
function createSelect(id, names) { return new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId(id).setPlaceholder('Pilih embed tersimpan').addOptions(names.slice(0, 25).map((name) => ({ label: name, value: name })))); }
function previewControls(name) { return new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`embed:publish:${name}`).setLabel('Publish').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId(`embed:edit:${name}`).setLabel('Edit').setStyle(ButtonStyle.Primary)); }
function parseButtons(value) { return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 5).map((line) => { const [label, ...url] = line.split('|'); return { label: (label || '').trim(), url: url.join('|').trim() }; }); }
async function chooseEmbed(interaction, action) { const names = EmbedService.listNames(); if (!names.length) return interaction.reply({ content: 'Belum ada embed yang tersimpan.', ephemeral: true }); return interaction.reply({ content: `Pilih embed untuk ${action}.`, components: [createSelect(`embed:${action}`, names)], ephemeral: true }); }

module.exports = {
  adminCooldown: true,
  data: new SlashCommandBuilder().setName('embed').setDescription('Mengelola embed JSON.').addSubcommand((sub) => sub.setName('create').setDescription('Membuat embed baru dengan wizard modal.')).addSubcommand((sub) => sub.setName('edit').setDescription('Mengedit embed tersimpan.')).addSubcommand((sub) => sub.setName('delete').setDescription('Menghapus embed tersimpan.')).addSubcommand((sub) => sub.setName('send').setDescription('Mengirim embed tersimpan.')).addSubcommand((sub) => sub.setName('preview').setDescription('Melihat preview embed secara private.')).addSubcommand((sub) => sub.setName('list').setDescription('Menampilkan daftar embed.')).addSubcommand((sub) => sub.setName('clone').setDescription('Menggandakan embed.').addStringOption((option) => option.setName('source').setDescription('Embed sumber.').setAutocomplete(true).setRequired(true)).addStringOption((option) => option.setName('name').setDescription('Nama embed baru.').setRequired(true).setMaxLength(64))).addSubcommand((sub) => sub.setName('export').setDescription('Mengunduh file JSON embed.').addStringOption((option) => option.setName('name').setDescription('Nama embed.').setAutocomplete(true).setRequired(true))).addSubcommand((sub) => sub.setName('import').setDescription('Mengimpor file JSON embed.').addAttachmentOption((option) => option.setName('file').setDescription('File JSON.').setRequired(true))),
  async autocomplete(interaction) { const focused = interaction.options.getFocused().toLowerCase(); await interaction.respond(EmbedService.listNames().filter((name) => name.includes(focused)).slice(0, 25).map((name) => ({ name, value: name }))); },
  async execute(interaction) {
    if (!(await PermissionService.guardEmbedManager(interaction))) return;
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'create') return interaction.showModal(createModal('embed:create:1', 'Embed Wizard 1/5', [{ id: 'name', label: 'Nama Embed', required: true, max: 64 }]));
    if (['edit', 'delete', 'send', 'preview'].includes(subcommand)) return chooseEmbed(interaction, subcommand);
    if (subcommand === 'list') { const names = EmbedService.listNames(); return interaction.reply({ content: names.length ? `Embed tersimpan:\n${names.map((name) => `• ${name}`).join('\n')}` : 'Belum ada embed yang tersimpan.', ephemeral: true }); }
    if (subcommand === 'clone') { const cloned = await EmbedService.clone(interaction.options.getString('source'), interaction.options.getString('name')); return interaction.reply({ content: `Embed berhasil digandakan menjadi ${cloned.name}.`, ephemeral: true }); }
    if (subcommand === 'export') { const embed = EmbedService.get(interaction.options.getString('name')); if (!embed) return interaction.reply({ content: 'Embed tidak ditemukan.', ephemeral: true }); return interaction.reply({ content: `File JSON untuk ${embed.name} berhasil dibuat.`, files: [EmbedService.attachment(embed)], ephemeral: true }); }
    if (subcommand === 'import') { const saved = await EmbedService.importFromAttachment(interaction.options.getAttachment('file')); return interaction.reply({ content: `Embed ${saved.name} berhasil diimpor.`, ephemeral: true }); }
  },
  async handleComponent(interaction) {
    if (!(await PermissionService.guardEmbedManager(interaction))) return;
    const [, action, name] = interaction.customId.split(':');
    const selectedName = interaction.isStringSelectMenu() ? interaction.values[0] : name;
    const embed = EmbedService.get(selectedName);
    if (!embed) return interaction.reply({ content: 'Embed tidak ditemukan atau belum dimuat ke cache.', ephemeral: true });
    if (action === 'send' || action === 'publish') { await interaction.channel.send(EmbedService.build(embed)); return interaction.reply({ content: `Embed ${selectedName} berhasil dikirim.`, ephemeral: true }); }
    if (action === 'preview') { const built = EmbedService.build(embed); return interaction.reply({ ...built, components: [...built.components, previewControls(selectedName)], ephemeral: true }); }
    if (action === 'edit') return interaction.showModal(createModal(`embed:editmodal:${selectedName}`, `Edit ${selectedName}`, [{ id: 'title', label: 'Judul', value: embed.title, max: 256 }, { id: 'description', label: 'Deskripsi', value: embed.description, style: TextInputStyle.Paragraph, max: 4000 }, { id: 'footer', label: 'Footer', value: embed.footer, max: 2048 }, { id: 'color', label: 'Warna HEX', value: embed.color, max: 16 }, { id: 'buttons', label: 'Tombol: label|url per baris', value: (embed.buttons || []).map((button) => `${button.label}|${button.url}`).join('\n'), style: TextInputStyle.Paragraph, max: 1000 }]));
    if (action === 'delete') return interaction.reply({ content: `Apakah Anda yakin ingin menghapus embed ${selectedName}?`, components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`embed:confirmdelete:${selectedName}`).setLabel('Ya, Hapus').setStyle(ButtonStyle.Danger))], ephemeral: true });
    if (action === 'confirmdelete') { await EmbedService.delete(selectedName); return interaction.update({ content: `Embed ${selectedName} berhasil dihapus. Backup otomatis dibuat jika file sebelumnya ada.`, components: [] }); }
  },
  async handleModal(interaction) {
    const parts = interaction.customId.split(':');
    if (parts[1] === 'create') {
      const step = Number(parts[2]);
      const prior = step === 1 ? {} : JSON.parse(interaction.fields.getTextInputValue('state') || '{}');
      if (step === 1) { prior.name = interaction.fields.getTextInputValue('name'); return interaction.showModal(createModal('embed:create:2', 'Embed Wizard 2/5', [{ id: 'state', label: 'State jangan diubah', value: JSON.stringify(prior), style: TextInputStyle.Paragraph }, { id: 'title', label: 'Judul', max: 256 }, { id: 'description', label: 'Deskripsi', style: TextInputStyle.Paragraph, max: 4000 }])); }
      if (step === 2) { prior.title = interaction.fields.getTextInputValue('title'); prior.description = interaction.fields.getTextInputValue('description'); return interaction.showModal(createModal('embed:create:3', 'Embed Wizard 3/5', [{ id: 'state', label: 'State jangan diubah', value: JSON.stringify(prior), style: TextInputStyle.Paragraph }, { id: 'footer', label: 'Footer', max: 2048 }, { id: 'color', label: 'Warna HEX', value: '#5865F2', max: 16 }])); }
      if (step === 3) { prior.footer = interaction.fields.getTextInputValue('footer'); prior.color = interaction.fields.getTextInputValue('color'); return interaction.showModal(createModal('embed:create:4', 'Embed Wizard 4/5', [{ id: 'state', label: 'State jangan diubah', value: JSON.stringify(prior), style: TextInputStyle.Paragraph }, { id: 'thumbnail', label: 'URL Thumbnail', max: 500 }, { id: 'image', label: 'URL Image', max: 500 }])); }
      if (step === 4) { prior.thumbnail = interaction.fields.getTextInputValue('thumbnail'); prior.image = interaction.fields.getTextInputValue('image'); return interaction.showModal(createModal('embed:create:5', 'Embed Wizard 5/5', [{ id: 'state', label: 'State jangan diubah', value: JSON.stringify(prior), style: TextInputStyle.Paragraph }, { id: 'buttons', label: 'Maks 5 tombol: label|url', style: TextInputStyle.Paragraph, max: 1000 }])); }
      prior.buttons = parseButtons(interaction.fields.getTextInputValue('buttons'));
      const saved = await EmbedService.save(prior);
      return interaction.reply({ content: `Embed ${saved.name} berhasil dibuat.`, ...EmbedService.build(saved), ephemeral: true });
    }
    if (parts[1] === 'editmodal') {
      const current = EmbedService.get(parts[2]);
      if (!current) return interaction.reply({ content: 'Embed tidak ditemukan.', ephemeral: true });
      const saved = await EmbedService.save({ ...current, title: interaction.fields.getTextInputValue('title'), description: interaction.fields.getTextInputValue('description'), footer: interaction.fields.getTextInputValue('footer'), color: interaction.fields.getTextInputValue('color'), buttons: parseButtons(interaction.fields.getTextInputValue('buttons')) });
      return interaction.reply({ content: `Embed ${saved.name} berhasil diperbarui.`, ephemeral: true });
    }
  }
};
