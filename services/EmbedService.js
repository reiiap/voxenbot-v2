// Business logic Embed Manager: cache, validasi, backup, render, import, export.
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const config = require('../config');
const StorageService = require('./StorageService');
const logger = require('../utils/Logger');

class EmbedService {
  constructor() { this.storage = new StorageService(config.paths.embeds); this.cache = new Map(); }
  defaultEmbed(name = '') { return { name, title: '', description: '', author: '', authorIcon: '', url: '', color: '#5865F2', footer: '', thumbnail: '', image: '', timestamp: true, fields: [], buttons: [] }; }
  async loadCache() {
    await this.storage.ensureDir();
    this.cache.clear();
    const files = await this.storage.listJsonFiles();
    for (const file of files) {
      const data = await this.storage.readJson(`${this.storage.basePath}/${file}`, null);
      const result = this.validate(data, { strictContent: false });
      if (result.ok) this.cache.set(result.embed.name, result.embed);
      else logger.warn(`Embed ${file} dilewati karena tidak valid: ${result.errors.join(', ')}`);
    }
    logger.success(`${this.cache.size} embed dimuat ke cache.`);
  }
  listNames() { return [...this.cache.keys()].sort(); }
  get(name) { return this.cache.get(this.storage.safeName(name)) || null; }
  isUrl(value) { return !value || /^https?:\/\/.+/i.test(String(value)); }
  isHex(value) { return /^#?[0-9a-f]{6}$/i.test(String(value || '')); }
  normalize(raw) {
    const embed = { ...this.defaultEmbed(raw?.name), ...(raw || {}) };
    embed.name = this.storage.safeName(embed.name || embed.title || 'embed');
    embed.color = embed.color || '#5865F2';
    if (embed.color && !embed.color.startsWith('#')) embed.color = `#${embed.color}`;
    embed.title = String(embed.title || '').slice(0, 256);
    embed.description = String(embed.description || '').slice(0, 4096);
    embed.footer = String(embed.footer || '').slice(0, 2048);
    embed.author = String(embed.author || '').slice(0, 256);
    embed.fields = Array.isArray(embed.fields) ? embed.fields.slice(0, 25).map((field) => ({ name: String(field.name || 'Field').slice(0, 256), value: String(field.value || 'Value').slice(0, 1024), inline: Boolean(field.inline) })) : [];
    embed.buttons = Array.isArray(embed.buttons) ? embed.buttons.slice(0, 5).filter((button) => button?.label && button?.url).map((button) => ({ label: String(button.label).slice(0, 80), url: String(button.url).slice(0, 512) })) : [];
    embed.timestamp = Boolean(embed.timestamp);
    return embed;
  }
  validate(raw, options = {}) {
    const strictContent = options.strictContent !== false;
    const embed = this.normalize(raw);
    const errors = [];
    if (!embed.name) errors.push('Nama embed wajib diisi.');
    if (strictContent && !embed.title && !embed.description && !embed.fields.length) errors.push('Isi minimal judul, deskripsi, atau field.');
    if (raw?.title && String(raw.title).length > 256) errors.push('Judul maksimal 256 karakter.');
    if (raw?.description && String(raw.description).length > 4096) errors.push('Deskripsi maksimal 4096 karakter.');
    if (!this.isHex(embed.color)) errors.push('Warna harus menggunakan format HEX, contoh #5865F2.');
    for (const [label, value] of Object.entries({ URL: embed.url, Thumbnail: embed.thumbnail, Image: embed.image, 'Ikon author': embed.authorIcon })) if (!this.isUrl(value)) errors.push(`${label} harus berupa URL http atau https.`);
    if (Array.isArray(raw?.fields) && raw.fields.length > 25) errors.push('Jumlah field maksimal 25.');
    if (Array.isArray(raw?.buttons) && raw.buttons.length > 5) errors.push('Jumlah tombol maksimal 5.');
    for (const button of embed.buttons) { if (!button.label) errors.push('Label tombol wajib diisi.'); if (!this.isUrl(button.url)) errors.push(`URL tombol "${button.label}" tidak valid.`); }
    return { ok: errors.length === 0, errors, embed };
  }
  async save(raw) {
    const result = this.validate(raw);
    if (!result.ok) throw new Error(result.errors.join('\n'));
    if (this.cache.has(result.embed.name) || await this.storage.exists(result.embed.name)) await this.storage.backupJson(result.embed.name, config.paths.backups);
    await this.storage.write(result.embed.name, result.embed);
    this.cache.set(result.embed.name, result.embed);
    return result.embed;
  }
  async delete(name) {
    const safe = this.storage.safeName(name);
    await this.storage.backupJson(safe, config.paths.backups);
    const deleted = await this.storage.delete(safe);
    this.cache.delete(safe);
    return deleted;
  }
  async clone(source, target) {
    const current = this.get(source);
    if (!current) throw new Error('Embed sumber tidak ditemukan.');
    return this.save({ ...current, name: target });
  }
  build(embedData) {
    const data = this.normalize(embedData);
    const embed = new EmbedBuilder().setColor(data.color);
    if (data.title) embed.setTitle(data.title);
    if (data.description) embed.setDescription(data.description);
    if (data.url) embed.setURL(data.url);
    if (data.author) embed.setAuthor({ name: data.author, iconURL: data.authorIcon || undefined });
    if (data.footer) embed.setFooter({ text: data.footer });
    if (data.thumbnail) embed.setThumbnail(data.thumbnail);
    if (data.image) embed.setImage(data.image);
    if (data.timestamp) embed.setTimestamp();
    if (data.fields.length) embed.addFields(data.fields);
    const components = data.buttons.length ? [new ActionRowBuilder().addComponents(data.buttons.map((button) => new ButtonBuilder().setLabel(button.label).setURL(button.url).setStyle(ButtonStyle.Link)))] : [];
    return { embeds: [embed], components };
  }
  attachment(embedData) { const data = this.normalize(embedData); return new AttachmentBuilder(Buffer.from(JSON.stringify(data, null, 2)), { name: `${data.name}.json` }); }
}

module.exports = new EmbedService();
