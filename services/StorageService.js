// Service penyimpanan JSON berbasis fs/promises dengan fallback aman.
const fs = require('node:fs/promises');
const path = require('node:path');
const logger = require('../utils/Logger');

class StorageService {
  constructor(basePath) { this.basePath = path.resolve(basePath); }
  async ensureDir(dir = this.basePath) { await fs.mkdir(dir, { recursive: true }); }
  safeName(name) { return String(name || '').toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
  jsonPath(name) { return path.join(this.basePath, `${this.safeName(name)}.json`); }
  async readJson(filePath, fallback = null) {
    try { return JSON.parse(await fs.readFile(filePath, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') logger.error(`Gagal membaca JSON: ${filePath}`, error); return fallback; }
  }
  async writeJson(filePath, data) { await this.ensureDir(path.dirname(filePath)); await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8'); }
  async read(name, fallback = null) { await this.ensureDir(); return this.readJson(this.jsonPath(name), fallback); }
  async write(name, data) { await this.writeJson(this.jsonPath(name), data); }
  async delete(name) { try { await fs.unlink(this.jsonPath(name)); return true; } catch (error) { if (error.code !== 'ENOENT') logger.error('Gagal menghapus file JSON.', error); return false; } }
  async exists(name) { try { await fs.access(this.jsonPath(name)); return true; } catch { return false; } }
  async listJsonFiles() { await this.ensureDir(); const files = await fs.readdir(this.basePath).catch(() => []); return files.filter((file) => file.endsWith('.json')); }
  async backupJson(name, backupRoot) {
    const source = this.jsonPath(name);
    try {
      const date = new Date().toISOString().slice(0, 10);
      const targetDir = path.resolve(backupRoot, date);
      await this.ensureDir(targetDir);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      await fs.copyFile(source, path.join(targetDir, `${this.safeName(name)}-${stamp}.json`));
      return true;
    } catch (error) {
      if (error.code !== 'ENOENT') logger.warn('Backup otomatis gagal dibuat.', error.message);
      return false;
    }
  }
}

module.exports = StorageService;
