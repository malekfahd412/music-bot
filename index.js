/**
 * index.js — PremiumBeats Discord Music Bot
 * Entry point: sets up Discord client, DisTube, commands, and events.
 */
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin }    = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin }      = require('@distube/yt-dlp');
const fs   = require('fs');
const path = require('path');

// ── Validate environment ─────────────────────────────────────────────────────
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in .env — please check your .env file.');
  process.exit(1);
}

// ── Discord Client ───────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands  = new Collection();   // Slash commands
client.settings  = new Map();          // Per-guild settings { djRole, alwaysOn, aiSpeaker }

// ── DisTube Music Player ─────────────────────────────────────────────────────
client.distube = new DisTube(client, {
  leaveOnStop:            false,
  leaveOnEmpty:           true,
  leaveOnEmptyCooldown:   30_000,
  leaveOnFinish:          false,
  nsfw:                   false,
  plugins: [
    new SpotifyPlugin({ emitEventsAfterFetching: true }),
    new SoundCloudPlugin(),
    new YtDlpPlugin({ update: false }),
  ],
});

// ── Load Slash Commands ──────────────────────────────────────────────────────
const cmdDir = path.join(__dirname, 'src', 'commands');
for (const file of fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'))) {
  const exports = require(path.join(cmdDir, file));
  const list = Array.isArray(exports) ? exports : [exports];
  for (const cmd of list) {
    client.commands.set(cmd.data.name, cmd);
    console.log(`  ✔ Loaded command: /${cmd.data.name}`);
  }
}

// ── Load Discord.js Events ───────────────────────────────────────────────────
const evtDir = path.join(__dirname, 'src', 'events');
for (const file of fs.readdirSync(evtDir).filter(f => f.endsWith('.js'))) {
  const mod = require(path.join(evtDir, file));

  if (typeof mod === 'function') {
    // DisTube setup function — called after client is ready
    mod(client);
  } else if (mod.name) {
    // Standard Discord.js event
    if (mod.once) {
      client.once(mod.name, (...args) => mod.execute(...args, client));
    } else {
      client.on(mod.name, (...args) => mod.execute(...args, client));
    }
    console.log(`  ✔ Loaded event:   ${mod.name}`);
  }
}

// ── Login ────────────────────────────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
