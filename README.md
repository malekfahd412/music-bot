# 🎵 PremiumBeats — Discord Music Bot

A feature-rich, premium Discord music bot with multi-source playback, audio filters, queue management, DJ permissions, and an **AI DJ Speaker** powered by Claude.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎵 **Multi-source playback** | YouTube, Spotify, SoundCloud, direct MP3/URL |
| 🔍 **Search** | Search YouTube and pick from 5 results with buttons |
| 📋 **Queue management** | View, remove, move, clear, jump, shuffle |
| 🎛️ **Audio filters** | 15+ filters: bass boost, nightcore, vaporwave, karaoke, 3D, echo… |
| 🔈 **Bass boost presets** | Low / Medium / High / Extreme |
| 🔁 **Loop modes** | Off / Song / Queue |
| 🔒 **24/7 mode** | Bot stays in VC even when no one is listening |
| 🎧 **DJ role** | Restrict music controls to a specific role |
| 🤖 **AI DJ Speaker** | Claude AI generates hype announcements for every song |
| 🎨 **Premium embeds** | Beautiful, color-coded embeds with progress bars |

---

## 🚀 Setup

### 1. Prerequisites
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **yt-dlp** installed and in PATH — [yt-dlp.org](https://github.com/yt-dlp/yt-dlp#installation)
- **FFmpeg** installed and in PATH — [ffmpeg.org](https://ffmpeg.org/download.html)

### 2. Create a Discord Bot
1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Click **New Application** → name it (e.g. "PremiumBeats")
3. Go to **Bot** → click **Add Bot**
4. Under **Privileged Gateway Intents**, enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Copy your **Bot Token** (keep it secret!)
6. Go to **OAuth2 → General** and copy your **Client ID**

### 3. Invite the Bot to Your Server
Use this URL (replace `YOUR_CLIENT_ID`):
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot+applications.commands
```

### 4. Install & Configure
```bash
# Clone or extract the bot folder
cd music-bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env` and fill in your values:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
ANTHROPIC_API_KEY=your_anthropic_key_here   # optional, for AI DJ Speaker
```

### 5. Deploy Commands & Start
```bash
# Register slash commands (run once)
npm run deploy

# Start the bot
npm start

# Development mode (auto-restart)
npm run dev
```

---

## 📖 Commands

### 🎵 Music
| Command | Description |
|---|---|
| `/play <query>` | Play from YouTube, Spotify, SoundCloud, or URL |
| `/search <query>` | Search YouTube, pick from 5 results |
| `/nowplaying` | Show current song with progress bar |
| `/seek <time>` | Jump to a timestamp (e.g. `1:30` or `90`) |

### ⏯️ Playback
| Command | Description |
|---|---|
| `/skip [amount]` | Skip 1 or more songs |
| `/pause` | Pause playback |
| `/resume` | Resume playback |
| `/stop` | Stop and clear the queue |
| `/volume <1-200>` | Set volume percentage |
| `/loop <off/song/queue>` | Set repeat mode |
| `/shuffle` | Shuffle the queue |

### 📋 Queue
| Command | Description |
|---|---|
| `/queue [page]` | View the queue |
| `/remove <position>` | Remove a song |
| `/clear` | Clear all queued songs |
| `/move <from> <to>` | Reorder a song |
| `/jump <position>` | Skip directly to a song |

### 🎛️ Filters
| Command | Description |
|---|---|
| `/filter <name>` | Toggle an audio filter (use `list` or `clear`) |
| `/bassboost <level>` | Quick bass boost preset |

Available filters: `3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`, `flanger`, `reverse`, `surround`, `normalizer`, `pulsator`, `subboost`, `trebleboost`, `mono`, `earrape`

### ⚙️ Server Settings *(Manage Server required)*
| Command | Description |
|---|---|
| `/247` | Toggle 24/7 mode |
| `/djrole [role]` | Set/clear the DJ role |
| `/aispeaker` | Toggle AI DJ announcements |
| `/settings` | View all current settings |
| `/help` | Show command list |

---

## 🤖 AI DJ Speaker

When enabled with `/aispeaker`, the bot calls **Claude AI** to generate a unique, energetic DJ announcement every time a new song plays. Example:

> 🤖 **AI DJ:** 🔥 We're about to vibe with some absolute heat — this track hits different at 2AM! 🎵

Requires an `ANTHROPIC_API_KEY` in your `.env`. Get one at [console.anthropic.com](https://console.anthropic.com).

---

## 🛠️ Troubleshooting

**"No results found" / playback errors**
- Make sure `yt-dlp` is installed: `yt-dlp --version`
- Update yt-dlp: `yt-dlp -U`

**Spotify not working**
- Spotify URLs are resolved via YouTube — you don't need a Spotify API key
- Make sure `@distube/spotify` is installed

**Bot won't join voice channel**
- Check the bot has `Connect` and `Speak` permissions in the voice channel

**Commands not showing up**
- Run `npm run deploy` and wait up to 1 hour for global propagation
- For instant testing: modify `deploy-commands.js` to use `Routes.applicationGuildCommands(clientId, guildId)`

---

## 📦 Tech Stack

- [discord.js v14](https://discord.js.org) — Discord API wrapper
- [DisTube v4](https://distube.js.org) — Music player engine
- [@distube/spotify](https://github.com/distubejs/spotify) — Spotify support
- [@distube/soundcloud](https://github.com/distubejs/soundcloud) — SoundCloud support
- [@distube/yt-dlp](https://github.com/distubejs/yt-dlp) — Universal URL support
- [Claude API](https://docs.anthropic.com) — AI DJ announcements
