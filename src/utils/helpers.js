/**
 * src/utils/helpers.js
 * Shared helper functions used across commands
 */

function inVoiceChannel(interaction) {
  if (!interaction.member.voice?.channel) {
    interaction.reply({
      content: '🔇 You must be in a voice channel to use this command!',
      ephemeral: true,
    });
    return false;
  }
  return true;
}

function queueExists(interaction) {
  const queue = interaction.client.distube.getQueue(interaction.guild);
  if (!queue) {
    interaction.reply({
      content: '🎵 There is nothing playing right now!',
      ephemeral: true,
    });
    return null;
  }
  return queue;
}

function hasDjPermission(interaction) {
  const settings = interaction.client.settings.get(interaction.guild.id);
  if (!settings?.djRole) return true;

  const member = interaction.member;
  if (member.permissions.has('Administrator')) return true;
  if (member.roles.cache.has(settings.djRole)) return true;

  interaction.reply({
    content: `🎧 You need the <@&${settings.djRole}> role to use this command!`,
    ephemeral: true,
  });
  return false;
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function progressBar(current, total, length = 16) {
  const pct = total > 0 ? Math.min(current / total, 1) : 0;
  const filled = Math.round(pct * length);
  const bar = '▰'.repeat(filled) + '▱'.repeat(length - filled);
  return `\`${bar}\` \`${Math.round(pct * 100)}%\``;
}

module.exports = { inVoiceChannel, queueExists, hasDjPermission, formatDuration, progressBar };
