/**
 * src/events/distube.js
 * Registers all DisTube music player events.
 * Exported as a function and called from index.js after setup.
 */
const { EmbedBuilder } = require('discord.js');
const { nowPlayingEmbed, addedEmbed, musicEmbed, errorEmbed, COLORS } = require('../utils/embeds');
const { progressBar } = require('../utils/helpers');
const { generateAnnouncement } = require('../utils/aiAnnouncer');

module.exports = function registerDisTubeEvents(client) {
  const dt = client.distube;

  // ── Song starts playing ──────────────────────────────────────────────────
  dt.on('playSong', async (queue, song) => {
    const s = client.settings.get(queue.id) ?? {};
    const bar = progressBar(0, song.duration);

    try {
      await queue.textChannel?.send({ embeds: [nowPlayingEmbed(song, queue, bar)] });

      // AI DJ announcement
      if (s.aiSpeaker && process.env.ANTHROPIC_API_KEY) {
        const line = await generateAnnouncement(song);
        if (line) await queue.textChannel?.send(`🤖 **AI DJ:** ${line}`);
      }
    } catch (err) {
      console.error('[DisTube:playSong]', err.message);
    }
  });

  // ── Song added to queue ──────────────────────────────────────────────────
  dt.on('addSong', (queue, song) => {
    // Only show "added" embed if something is already playing (not the first song)
    if (queue.songs.length > 1) {
      queue.textChannel?.send({ embeds: [addedEmbed(song, queue.songs.length)] }).catch(() => {});
    }
  });

  // ── Playlist added ───────────────────────────────────────────────────────
  dt.on('addList', (queue, playlist) => {
    const embed = new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle('📋 Playlist Added to Queue')
      .setDescription(`**[${playlist.name}](${playlist.url ?? ''})**`)
      .addFields(
        { name: '🎵 Songs Added', value: `${playlist.songs.length}`, inline: true },
        { name: '👤 Requested by', value: playlist.member?.toString() ?? 'Unknown', inline: true },
      )
      .setTimestamp();
    queue.textChannel?.send({ embeds: [embed] }).catch(() => {});
  });

  // ── Queue finished ───────────────────────────────────────────────────────
  dt.on('finish', queue => {
    const s = client.settings.get(queue.id) ?? {};
    if (s.alwaysOn) return;
    queue.textChannel?.send({
      embeds: [musicEmbed('🏁 Queue Finished', 'No more songs. Add more with `/play`!', COLORS.WARNING)],
    }).catch(() => {});
  });

  // ── Voice channel empty ──────────────────────────────────────────────────
  dt.on('empty', queue => {
    const s = client.settings.get(queue.id) ?? {};
    if (s.alwaysOn) return;
    queue.textChannel?.send({
      embeds: [musicEmbed('💤 Channel Empty', 'Everyone left — I\'ll disconnect in 30 seconds.', COLORS.WARNING)],
    }).catch(() => {});
  });

  // ── Bot disconnected ─────────────────────────────────────────────────────
  dt.on('disconnect', queue => {
    queue.textChannel?.send({
      embeds: [musicEmbed('👋 Disconnected', 'Left the voice channel. See you next time!', COLORS.WARNING)],
    }).catch(() => {});
  });

  // ── Error ────────────────────────────────────────────────────────────────
  dt.on('error', (error, queue, song) => {
    console.error('[DisTube ERROR]', error.message);
    queue?.textChannel?.send({
      embeds: [errorEmbed(`Error playing **${song?.name ?? 'Unknown'}**:\n\`${error.message}\``)],
    }).catch(() => {});
  });

  console.log('🎵 DisTube events registered.');
};
