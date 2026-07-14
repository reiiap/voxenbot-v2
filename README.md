# VoxenBot v2

VoxenBot v2 is a production-ready Discord.js v14 bot for Node.js 22+ with a TicketTool-style JSON Embed Manager, utility commands, and a Railway-friendly verification API.

## Features

- CommonJS JavaScript, no TypeScript.
- Modular `commands/`, `events/`, `utils/`, `verification/`, `embeds/`, and `data/` folders.
- JSON-only persistence with automatic folder creation.
- `/embed` manager with create, edit, delete, send, preview, list, clone, export, and import.
- Embed support for title, description, author, footer, URL, thumbnail, image, timestamp, color, 25 fields, and 5 link buttons.
- Utility commands: `/ping`, `/purge`, `/say`, `/announce`.
- Permission system driven by owner ID and allowed/admin/developer/moderator role IDs.
- Express verification API compatible with previous integrations.
- Global error logging and safe JSON fallbacks.

## Install

```bash
npm install
cp .env.example .env
```

Edit `.env` with your Discord bot token, application client ID, and role IDs.

## Register Commands

```bash
npm run deploy
```

Set `GUILD_ID` for fast guild-scoped command updates during development. Leave it empty for global commands.

## Start

```bash
npm start
```

## Railway Deploy

1. Push this repository to GitHub.
2. Create a Railway project from the repository.
3. Add the variables from `.env.example` in Railway Variables.
4. Railway will run `npm install` and `npm start`.
5. Run `npm run deploy` once from a shell with the same variables, or use a Railway one-off command.

## Environment Variables

| Name | Required | Description |
| --- | --- | --- |
| `DISCORD_TOKEN` | Yes | Discord bot token. |
| `CLIENT_ID` | Yes | Discord application client ID. |
| `GUILD_ID` | No | Guild ID for instant slash command deployment. |
| `OWNER_ID` | Recommended | User ID with full Embed Manager access. |
| `ADMIN_ROLE_IDS` | No | Comma-separated role IDs. |
| `DEVELOPER_ROLE_IDS` | No | Comma-separated role IDs. |
| `MODERATOR_ROLE_IDS` | No | Comma-separated role IDs. |
| `ALLOWED_ROLE_IDS` | No | Additional comma-separated role IDs. |
| `PORT` | No | Express API port; Railway injects this automatically. |

## Commands

### `/embed`

- `create` opens a guided modal wizard.
- `edit` selects and edits an existing embed.
- `delete` asks for confirmation before deleting JSON.
- `send` selects and publishes a saved embed.
- `preview` privately previews with Publish and Edit buttons.
- `list` displays saved embeds.
- `clone` duplicates an embed JSON file.
- `export` sends the JSON file.
- `import` validates and saves an uploaded JSON file.

Saved embeds live in `embeds/<name>.json`.

### Utilities

- `/ping` shows API latency.
- `/purge amount:<1-100>` bulk deletes messages and requires Manage Messages.
- `/say message:<text>` sends a plain bot message.
- `/announce title:<text> message:<text> color:<hex>` sends an embed announcement.

## Verification API

The Express API stores data in `verification/verification-store.json`.

### `POST /verification/request`

```json
{
  "player": "PlayerName",
  "discordId": "123456789012345678"
}
```

### `GET /verification/status/:player`

Returns the current verification status or `unknown`.

## Embed JSON Format

```json
{
  "name": "whatsapp",
  "title": "Title",
  "description": "Description",
  "author": "Author name",
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
