/**
 * src/commands/queue.js
 * Queue management: queue, remove, clear, move, jump
 */
const { SlashCommandBuilder } = require('discord.js');
const { queueExists, hasDjPermission } = require('../utils/helpers');
const { queueEmbed, successEmbed, errorEmbed } = require('../utils/embeds');

module.exports = [

  // ── /queue ──────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('queue')
      .setDescription('📋 View the music queue')
      .addIntegerOption(o => o.setName('page').setDescription('Page number').setMinValue(1)),
    async execute(interaction) {
      const queue = queueExists(interaction);
      if (!queue) return;

      const page = interaction.options.getInteger('page') ?? 1;
      const totalPages = Math.ceil((queue.songs.length - 1) / 10) || 1;

      if (page > totalPages) {
        return interaction.reply({ embeds: [errorEmbed(`Page ${page} doesn't exist (max: ${totalPages})`)] });
      }
      await interaction.reply({ embeds: [queueEmbed(queue, page)] });
    },
  },

  // ── /remove ─────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('remove')
      .setDescription('🗑️ Remove a specific song from the queue')
      .addIntegerOption(o => o.setName('position').setDescription('Queue position (starts at 2)').setMinValue(2).setRequired(true)),
    async execute(interaction) {
      if (!hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const pos = interaction.options.getInteger('position');
      if (pos > queue.songs.length) {
        return interaction.reply({ embeds: [errorEmbed(`Position ${pos} is out of range. Queue has ${queue.songs.length} song(s).`)] });
      }

      const [removed] = queue.songs.splice(pos - 1, 1);
      await interaction.reply({ embeds: [successEmbed(`Removed **${removed.name}** from position #${pos}.`)] });
    },
  },

  // ── /clear ──────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('clear')
      .setDescription('🧹 Clear all queued songs (keeps current song playing)'),
    async execute(interaction) {
      if (!hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const count = queue.songs.length - 1;
      if (count === 0) return interaction.reply({ embeds: [errorEmbed('The queue is already empty!')] });

      queue.songs.splice(1);
      await interaction.reply({ embeds: [successEmbed(`Cleared **${count}** song(s) from the queue. 🧹`)] });
    },
  },

  // ── /move ───────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('move')
      .setDescription('↕️ Move a song to a different position in the queue')
      .addIntegerOption(o => o.setName('from').setDescription('Current position').setMinValue(2).setRequired(true))
      .addIntegerOption(o => o.setName('to').setDescription('New position').setMinValue(2).setRequired(true)),
    async execute(interaction) {
      if (!hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const from = interaction.options.getInteger('from');
      const to   = interaction.options.getInteger('to');

      if (from > queue.songs.length || to > queue.songs.length) {
        return interaction.reply({ embeds: [errorEmbed('One or both positions are out of range!')] });
      }

      const [song] = queue.songs.splice(from - 1, 1);
      queue.songs.splice(to - 1, 0, song);
      await interaction.reply({ embeds: [successEmbed(`Moved **${song.name}** from #${from} → #${to} ↕️`)] });
    },
  },

  // ── /jump ───────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('jump')
      .setDescription('⏭️ Jump directly to a song in the queue (skips everything before it)')
      .addIntegerOption(o => o.setName('position').setDescription('Position to jump to').setMinValue(2).setRequired(true)),
    async execute(interaction) {
      if (!hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const pos = interaction.options.getInteger('position');
      if (pos > queue.songs.length) {
        return interaction.reply({ embeds: [errorEmbed(`Position ${pos} is out of range.`)] });
      }

      queue.songs.splice(1, pos - 2);
      await queue.skip();
      await interaction.reply({ embeds: [successEmbed(`Jumped to position **#${pos}** ⏭️`)] });
    },
  },
];
