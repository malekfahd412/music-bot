/**
 * src/commands/controls.js
 * Playback controls: skip, pause, resume, stop, volume, loop, shuffle, nowplaying, seek
 */
const { SlashCommandBuilder } = require('discord.js');
const { inVoiceChannel, queueExists, hasDjPermission, formatDuration, progressBar } = require('../utils/helpers');
const { nowPlayingEmbed, successEmbed, errorEmbed } = require('../utils/embeds');

module.exports = [

  // ── /skip ───────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('skip')
      .setDescription('⏭️ Skip the current song')
      .addIntegerOption(o => o.setName('amount').setDescription('Skip multiple songs').setMinValue(1).setMaxValue(20)),
    async execute(interaction) {
      if (!inVoiceChannel(interaction) || !hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const amount = interaction.options.getInteger('amount') ?? 1;
      if (amount > 1) queue.songs.splice(1, amount - 1);

      try {
        await queue.skip();
        await interaction.reply({ embeds: [successEmbed(`Skipped **${amount}** song${amount > 1 ? 's' : ''}! ⏭️`)] });
      } catch (e) {
        await interaction.reply({ embeds: [errorEmbed(e.message)] });
      }
    },
  },

  // ── /pause ──────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder().setName('pause').setDescription('⏸️ Pause playback'),
    async execute(interaction) {
      if (!inVoiceChannel(interaction) || !hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      if (queue.paused) return interaction.reply({ embeds: [errorEmbed('Already paused!')] });
      queue.pause();
      await interaction.reply({ embeds: [successEmbed('Paused ⏸️')] });
    },
  },

  // ── /resume ─────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder().setName('resume').setDescription('▶️ Resume playback'),
    async execute(interaction) {
      if (!inVoiceChannel(interaction) || !hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      if (!queue.paused) return interaction.reply({ embeds: [errorEmbed('Already playing!')] });
      queue.resume();
      await interaction.reply({ embeds: [successEmbed('Resumed ▶️')] });
    },
  },

  // ── /stop ───────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder().setName('stop').setDescription('⏹️ Stop music and clear the queue'),
    async execute(interaction) {
      if (!inVoiceChannel(interaction) || !hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      await queue.stop();
      await interaction.reply({ embeds: [successEmbed('Stopped playback and cleared the queue ⏹️')] });
    },
  },

  // ── /volume ─────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('volume')
      .setDescription('🔊 Set the playback volume')
      .addIntegerOption(o =>
        o.setName('percent').setDescription('Volume 1–200%').setMinValue(1).setMaxValue(200).setRequired(true)
      ),
    async execute(interaction) {
      if (!inVoiceChannel(interaction) || !hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const vol = interaction.options.getInteger('percent');
      queue.setVolume(vol);
      const icon = vol > 150 ? '🔊🔊' : vol > 80 ? '🔊' : vol > 40 ? '🔉' : '🔈';
      await interaction.reply({ embeds: [successEmbed(`${icon} Volume set to **${vol}%**`)] });
    },
  },

  // ── /loop ───────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('loop')
      .setDescription('🔁 Set repeat/loop mode')
      .addStringOption(o =>
        o.setName('mode').setDescription('Loop mode').setRequired(true)
          .addChoices(
            { name: '🔴 Off',   value: '0' },
            { name: '🔂 Song',  value: '1' },
            { name: '🔁 Queue', value: '2' },
          )
      ),
    async execute(interaction) {
      if (!inVoiceChannel(interaction) || !hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const mode = parseInt(interaction.options.getString('mode'));
      queue.setRepeatMode(mode);
      const labels = ['Loop disabled 🔴', 'Looping current song 🔂', 'Looping full queue 🔁'];
      await interaction.reply({ embeds: [successEmbed(labels[mode])] });
    },
  },

  // ── /shuffle ────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder().setName('shuffle').setDescription('🔀 Shuffle the queue'),
    async execute(interaction) {
      if (!inVoiceChannel(interaction) || !hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      await queue.shuffle();
      await interaction.reply({ embeds: [successEmbed(`Queue shuffled 🔀 (${queue.songs.length - 1} songs)`)] });
    },
  },

  // ── /nowplaying ─────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder().setName('nowplaying').setDescription('🎵 Show info about the current song'),
    async execute(interaction) {
      const queue = queueExists(interaction);
      if (!queue) return;

      const song = queue.songs[0];
      const bar = progressBar(queue.currentTime, song.duration);
      await interaction.reply({ embeds: [nowPlayingEmbed(song, queue, bar)] });
    },
  },

  // ── /seek ───────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('seek')
      .setDescription('⏩ Jump to a timestamp in the current song')
      .addStringOption(o =>
        o.setName('time').setDescription('Time: e.g. 1:30 or 90 (seconds)').setRequired(true)
      ),
    async execute(interaction) {
      if (!inVoiceChannel(interaction) || !hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const raw = interaction.options.getString('time');
      let seconds = 0;
      if (raw.includes(':')) {
        const parts = raw.split(':').reverse();
        seconds = parts.reduce((acc, p, i) => acc + parseInt(p) * Math.pow(60, i), 0);
      } else {
        seconds = parseInt(raw);
      }

      if (isNaN(seconds) || seconds < 0) {
        return interaction.reply({ embeds: [errorEmbed('Invalid time! Use `mm:ss` or total seconds.')] });
      }

      await queue.seek(seconds);
      await interaction.reply({ embeds: [successEmbed(`Seeked to **${formatDuration(seconds)}** ⏩`)] });
    },
  },
];
