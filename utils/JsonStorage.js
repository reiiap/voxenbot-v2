// Robust JSON-file persistence with automatic directory creation and crash-safe fallbacks.
const fs = require('node:fs/promises');
const path = require('node:path');

class JsonStorage {
  constructor(basePath) { this.basePath = path.resolve(basePath); }
  async ensureDir(dir = this.basePath) { await fs.mkdir(dir, { recursive: true }); }
  safeName(name) { return String(name || '').toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); }
  filePath(name) { return path.join(this.basePath, `${this.safeName(name)}.json`); }
  async readFile(file, fallback = null) {
    try { return JSON.parse(await fs.readFile(file, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') console.error(`JSON read failed for ${file}:`, error); return fallback; }
  }
  async writeFile(file, data) { await this.ensureDir(path.dirname(file)); await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8'); }
  async read(name, fallback = null) { await this.ensureDir(); return this.readFile(this.filePath(name), fallback); }
  async write(name, data) { await this.writeFile(this.filePath(name), data); }
  async delete(name) { try { await fs.unlink(this.filePath(name)); return true; } catch (e) { if (e.code !== 'ENOENT') console.error(e); return false; } }
  async exists(name) { try { await fs.access(this.filePath(name)); return true; } catch { return false; } }
  async list() { await this.ensureDir(); const files = await fs.readdir(this.basePath).catch(() => []); return files.filter((f) => f.endsWith('.json')).map((f) => path.basename(f, '.json')); }
}
module.exports = JsonStorage;
