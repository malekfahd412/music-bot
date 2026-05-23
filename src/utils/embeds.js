/**
 * src/utils/embeds.js
 * Rich embed builders for a premium look & feel
 */
const { EmbedBuilder } = require('discord.js');

const COLORS = {
  PRIMARY:  0x5865F2,
  SUCCESS:  0x57F287,
  WARNING:  0xFEE75C,
  ERROR:    0xED4245,
  MUSIC:    0xFF6B9D,
  QUEUE:    0x9B59B6,
  FILTER:   0xEB459E,
};

function musicEmbed(title, description, color = COLORS.MUSIC) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function nowPlayingEmbed(song, queue, bar) {
  const loops = ['🔴 Off', '🔂 Song', '🔁 Queue'];
  return new EmbedBuilder()
    .setColor(COLORS.MUSIC)
    .setTitle('🎵 Now Playing')
    .setDescription(`### [${song.name}](${song.url})`)
    .setThumbnail(song.thumbnail ?? null)
    .addFields(
      { name: '👤 Requested by', value: song.member?.toString() ?? 'Unknown', inline: true },
      { name: '⏱️ Duration',     value: song.formattedDuration ?? '∞ Live',    inline: true },
      { name: '🔊 Volume',       value: `${queue.volume}%`,                    inline: true },
      { name: '🔁 Loop',         value: loops[queue.repeatMode] ?? loops[0],   inline: true },
      { name: '📋 In Queue',     value: `${Math.max(queue.songs.length - 1, 0)} song(s)`, inline: true },
      { name: '🎛️ Filters',     value: queue.filters.names.length ? queue.filters.names.map(f => `\`${f}\``).join(' ') : 'None', inline: true },
      { name: '⏳ Progress',     value: bar ?? '`loading...`', inline: false },
    )
    .setFooter({ text: `🎧 ${song.uploader?.name ?? 'Unknown Artist'} • PremiumBeats` })
    .setTimestamp();
}

function addedEmbed(song, position) {
  return new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('➕ Added to Queue')
    .setDescription(`**[${song.name}](${song.url})**`)
    .setThumbnail(song.thumbnail ?? null)
    .addFields(
      { name: '⏱️ Duration', value: song.formattedDuration ?? 'Live', inline: true },
      { name: '📋 Position', value: `#${position}`,                   inline: true },
    )
    .setFooter({ text: `Requested by ${song.member?.displayName ?? 'Unknown'}` });
}

function queueEmbed(queue, page = 1) {
  const PAGE = 10;
  const start = (page - 1) * PAGE;
  const entries = queue.songs.slice(start + 1, start + PAGE + 1);
  const totalPages = Math.ceil((queue.songs.length - 1) / PAGE) || 1;

  const desc = entries.length
    ? entries.map((s, i) =>
        `\`${start + i + 2}.\` **[${s.name}](${s.url})** — \`${s.formattedDuration ?? 'Live'}\` · ${s.member?.toString() ?? 'Unknown'}`
      ).join('\n')
    : '*Queue is empty — add songs with `/play`*';

  return new EmbedBuilder()
    .setColor(COLORS.QUEUE)
    .setTitle('📋 Music Queue')
    .setDescription(desc)
    .addFields({ name: '🎵 Now Playing', value: `**${queue.songs[0]?.name ?? 'Nothing'}**` })
    .setFooter({ text: `Page ${page}/${totalPages} • ${queue.songs.length} total song(s)` })
    .setTimestamp();
}

function errorEmbed(msg) {
  return new EmbedBuilder().setColor(COLORS.ERROR).setTitle('❌ Error').setDescription(msg).setTimestamp();
}

function successEmbed(msg) {
  return new EmbedBuilder().setColor(COLORS.SUCCESS).setDescription(`✅ ${msg}`).setTimestamp();
}

module.exports = { musicEmbed, nowPlayingEmbed, addedEmbed, queueEmbed, errorEmbed, successEmbed, COLORS };
