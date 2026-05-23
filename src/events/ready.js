/**
 * src/events/ready.js
 * Fires once when the bot connects to Discord
 */
const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`\n╔═══════════════════════════════════╗`);
    console.log(`║  🎵 PremiumBeats is now online!   ║`);
    console.log(`║  Logged in as: ${client.user.tag.padEnd(18)}║`);
    console.log(`║  Servers:      ${String(client.guilds.cache.size).padEnd(18)}║`);
    console.log(`╚═══════════════════════════════════╝\n`);

    const statuses = [
      { name: '/play  🎵',                        type: ActivityType.Listening },
      { name: `${client.guilds.cache.size} servers`, type: ActivityType.Watching  },
      { name: 'your music 🎶',                    type: ActivityType.Playing   },
    ];

    let i = 0;
    const set = () => client.user.setActivity(statuses[i].name, { type: statuses[i].type });
    set();
    setInterval(() => { i = (i + 1) % statuses.length; set(); }, 30_000);
  },
};
