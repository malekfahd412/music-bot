/**
 * deploy-commands.js
 * Run this ONCE with `node deploy-commands.js` to register slash commands globally.
 */
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs   = require('fs');
const path = require('path');

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in .env');
  process.exit(1);
}

const commands = [];
const cmdDir = path.join(__dirname, 'src', 'commands');

for (const file of fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'))) {
  const exports = require(path.join(cmdDir, file));
  const list = Array.isArray(exports) ? exports : [exports];
  for (const cmd of list) {
    commands.push(cmd.data.toJSON());
    console.log(`  ✔ Registered: /${cmd.data.name}`);
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n🚀 Deploying ${commands.length} slash commands globally...`);
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
    console.log('✅ All commands deployed! (May take up to 1 hour to appear globally)\n');
  } catch (err) {
    console.error('❌ Deploy failed:', err.message);
  }
})();
