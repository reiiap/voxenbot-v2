// Reusable Embed Manager: validates, stores, renders embeds and link buttons.
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const JsonStorage = require('./JsonStorage');
const config = require('../config');

class EmbedManager {
  constructor() { this.storage = new JsonStorage(config.paths.embeds); }
  defaultEmbed(name = '') { return { name, title: '', description: '', author: '', authorIcon: '', url: '', color: '#5865F2', footer: '', thumbnail: '', image: '', timestamp: true, fields: [], buttons: [] }; }
  normalize(raw) {
    const e = { ...this.defaultEmbed(raw?.name), ...(raw || {}) };
    e.name = this.storage.safeName(e.name || e.title || 'embed');
    e.fields = Array.isArray(e.fields) ? e.fields.slice(0, 25).map((f) => ({ name: String(f.name || 'Field').slice(0, 256), value: String(f.value || 'Value').slice(0, 1024), inline: Boolean(f.inline) })) : [];
    e.buttons = Array.isArray(e.buttons) ? e.buttons.slice(0, 5).filter((b) => b?.label && b?.url).map((b) => ({ label: String(b.label).slice(0, 80), url: String(b.url).slice(0, 512) })) : [];
    return e;
  }
  validate(raw) {
    const e = this.normalize(raw); const errors = [];
    if (!e.name) errors.push('Embed name is required.');
    if (!e.title && !e.description) errors.push('Title or description is required.');
    for (const [k, v] of Object.entries({ thumbnail: e.thumbnail, image: e.image, url: e.url, authorIcon: e.authorIcon })) if (v && !/^https?:\/\//i.test(v)) errors.push(`${k} must be a valid http(s) URL.`);
    for (const b of e.buttons) if (!/^https?:\/\//i.test(b.url)) errors.push(`Button URL for "${b.label}" is invalid.`);
    return { ok: errors.length === 0, errors, embed: e };
  }
  async save(raw) { const result = this.validate(raw); if (!result.ok) throw new Error(result.errors.join('\n')); await this.storage.write(result.embed.name, result.embed); return result.embed; }
  async get(name) { return this.storage.read(name, null); }
  async list() { return this.storage.list(); }
  async delete(name) { return this.storage.delete(name); }
  async clone(source, target) { const e = await this.get(source); if (!e) throw new Error('Source embed not found.'); e.name = this.storage.safeName(target); return this.save(e); }
  build(e) {
    const data = this.normalize(e); const embed = new EmbedBuilder().setColor(data.color || '#5865F2');
    if (data.title) embed.setTitle(data.title); if (data.description) embed.setDescription(data.description); if (data.url) embed.setURL(data.url);
    if (data.author) embed.setAuthor({ name: data.author, iconURL: data.authorIcon || undefined }); if (data.footer) embed.setFooter({ text: data.footer });
    if (data.thumbnail) embed.setThumbnail(data.thumbnail); if (data.image) embed.setImage(data.image); if (data.timestamp) embed.setTimestamp(); if (data.fields.length) embed.addFields(data.fields);
    const rows = data.buttons.length ? [new ActionRowBuilder().addComponents(data.buttons.map((b) => new ButtonBuilder().setLabel(b.label).setURL(b.url).setStyle(ButtonStyle.Link)))] : [];
    return { embeds: [embed], components: rows };
  }
  attachment(e) { return new AttachmentBuilder(Buffer.from(JSON.stringify(this.normalize(e), null, 2)), { name: `${this.storage.safeName(e.name)}.json` }); }
}
module.exports = new EmbedManager();
