// Logger berwarna untuk output terminal yang konsisten di production.
const colors = {
  reset: '\x1b[0m', dim: '\x1b[2m', red: '\x1b[31m', yellow: '\x1b[33m', green: '\x1b[32m', cyan: '\x1b[36m', magenta: '\x1b[35m'
};

class Logger {
  constructor() { this.debugEnabled = process.env.DEBUG === 'true'; }
  format(level, color, args) {
    const time = new Date().toISOString();
    return [`${colors.dim}${time}${colors.reset}`, `${color}${level}${colors.reset}`, ...args];
  }
  info(...args) { console.log(...this.format('INFO', colors.cyan, args)); }
  success(...args) { console.log(...this.format('SUKSES', colors.green, args)); }
  warn(...args) { console.warn(...this.format('PERINGATAN', colors.yellow, args)); }
  error(...args) { console.error(...this.format('ERROR', colors.red, args)); }
  debug(...args) { if (this.debugEnabled) console.log(...this.format('DEBUG', colors.magenta, args)); }
}

module.exports = new Logger();
