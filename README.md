# VoxenBot v2

VoxenBot v2 adalah Discord bot production-ready berbasis Node.js 22+, CommonJS, dan Discord.js v14. Bot ini menyediakan Embed Manager seperti TicketTool, command utility, permission berbasis role, cooldown admin, cache embed, backup otomatis, serta verification API berbasis JSON tanpa MongoDB atau SQL.

## Cara Install

```bash
npm install
cp .env.example .env
```

Isi file `.env` sesuai konfigurasi server Discord Anda, lalu daftarkan slash command:

```bash
npm run deploy
```

Jalankan bot:

```bash
npm start
```

## Cara Deploy Railway

1. Push repository ke GitHub.
2. Buat project baru di Railway dari repository tersebut.
3. Tambahkan semua environment variable dari `.env.example` ke Railway Variables.
4. Railway akan menjalankan `npm install` dan `npm start`.
5. Jalankan `npm run deploy` satu kali dengan environment variable yang sama untuk mendaftarkan slash command.
6. Jika ingin deploy command lebih cepat saat development, isi `GUILD_ID`. Jika ingin global command, kosongkan `GUILD_ID`.

## Konfigurasi

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `DISCORD_TOKEN` | Ya | Token bot Discord. |
| `CLIENT_ID` | Ya | Application ID bot Discord. |
| `GUILD_ID` | Tidak | Guild ID untuk register command secara instan saat development. |
| `OWNER_ID` | Disarankan | User ID owner yang selalu boleh memakai Embed Manager. |
| `ADMIN_ROLE_IDS` | Tidak | Role admin, pisahkan dengan koma. |
| `DEVELOPER_ROLE_IDS` | Tidak | Role developer, pisahkan dengan koma. |
| `MODERATOR_ROLE_IDS` | Tidak | Role moderator, pisahkan dengan koma. |
| `ALLOWED_ROLE_IDS` | Tidak | Role tambahan yang boleh memakai Embed Manager. |
| `ADMIN_COMMAND_COOLDOWN_SECONDS` | Tidak | Cooldown command admin dalam detik. Default `5`. |
| `PORT` | Tidak | Port Express API. Railway biasanya mengisi otomatis. |
| `DEBUG` | Tidak | Isi `true` untuk menampilkan log debug. |

## Permission

Embed Manager hanya dapat digunakan oleh:

- Owner sesuai `OWNER_ID`.
- Member dengan permission Discord Administrator.
- Role yang ada di `ADMIN_ROLE_IDS`.
- Role yang ada di `DEVELOPER_ROLE_IDS`.
- Role yang ada di `MODERATOR_ROLE_IDS`.
- Role yang ada di `ALLOWED_ROLE_IDS`.

Permission logic berada di `services/PermissionService.js` dengan method:

- `isOwner()`
- `isAdmin()`
- `isDeveloper()`
- `isModerator()`
- `hasAllowedRole()`

## Command

### Embed Manager

`/embed` memiliki subcommand:

- `create` — membuat embed baru melalui modal wizard 5 langkah.
- `edit` — mengedit embed tersimpan.
- `delete` — menghapus embed dengan konfirmasi dan backup otomatis.
- `send` — memilih dan mengirim embed tersimpan.
- `preview` — menampilkan preview private dengan tombol Publish dan Edit.
- `list` — menampilkan daftar embed dari cache.
- `clone` — menggandakan embed.
- `export` — mengirim file JSON embed.
- `import` — mengimpor file JSON embed setelah validasi.

Embed disimpan di folder `embeds/` dan dimuat ke memori saat bot menyala. Command tidak membaca file JSON setiap kali dijalankan.

### Utility

- `/ping` — menampilkan latency API Discord.
- `/purge` — menghapus pesan, membutuhkan permission Manage Messages.
- `/say` — bot mengirim pesan teks biasa.
- `/announce` — bot mengirim pengumuman embed.

## Verification API

Data verification disimpan di `verification/verification-store.json`.

### POST `/verification/request`

```json
{
  "player": "PlayerName",
  "discordId": "123456789012345678"
}
```

### GET `/verification/status/:player`

Mengembalikan status verification player, atau `unknown` jika belum ada.

## Struktur Folder

```text
voxenbot/
├── commands/              # Slash command, tipis dan memanggil service
├── components/            # Placeholder component tambahan
├── data/                  # Data runtime dan backup
│   └── backups/YYYY-MM-DD # Backup embed otomatis
├── embeds/                # File JSON embed
├── events/                # Event Discord.js
├── handlers/              # Routing command, event, modal, button, select, autocomplete
├── services/              # Business logic utama
├── utils/                 # Utility umum seperti Logger
├── verification/          # Express verification API
├── config.js              # Konfigurasi environment
├── deploy-commands.js     # Register slash command
├── index.js               # Entrypoint bot
├── package.json
└── README.md
```

## Format JSON Embed

```json
{
  "name": "whatsapp",
  "title": "Judul",
  "description": "Deskripsi",
  "author": "Nama Author",
  "authorIcon": "https://example.com/icon.png",
  "url": "https://example.com",
  "color": "#5865F2",
  "footer": "Footer",
  "thumbnail": "https://example.com/thumb.png",
  "image": "https://example.com/image.png",
  "timestamp": true,
  "fields": [
    { "name": "Field", "value": "Value", "inline": false }
  ],
  "buttons": [
    { "label": "Website", "url": "https://example.com" }
  ]
}
```
