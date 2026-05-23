/**
 * src/commands/filters.js
 * Audio filters: toggle individual filters, bass boost presets
 */
const { SlashCommandBuilder } = require('discord.js');
const { queueExists, hasDjPermission } = require('../utils/helpers');
const { successEmbed, errorEmbed, musicEmbed, COLORS } = require('../utils/embeds');

const FILTERS = {
  '3d':          '🎭 3D Surround',
  'bassboost':   '🔈 Bass Boost',
  'echo':        '🔊 Echo',
  'karaoke':     '🎤 Karaoke (vocals removed)',
  'nightcore':   '🌙 Nightcore (sped up)',
  'vaporwave':   '🌊 Vaporwave (slowed)',
  'flanger':     '🔄 Flanger',
  'reverse':     '⏪ Reverse',
  'surround':    '🔉 Surround Sound',
  'normalizer':  '⚖️ Normalizer',
  'pulsator':    '💓 Pulsator',
  'subboost':    '💥 Sub Boost',
  'trebleboost': '🎶 Treble Boost',
  'mono':        '📻 Mono',
  'earrape':     '💀 Earrape',
};

module.exports = [

  // ── /filter ─────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('filter')
      .setDescription('🎛️ Toggle an audio filter on/off (use "list" to see all, "clear" to remove all)')
      .addStringOption(o =>
        o.setName('name')
          .setDescription('Filter name, "list", or "clear"')
          .setRequired(true)
          .setAutocomplete(true)
      ),

    async autocomplete(interaction) {
      const focused = interaction.options.getFocused().toLowerCase();
      const choices = [
        { name: '📋 List all filters',   value: 'list' },
        { name: '❌ Clear all filters',  value: 'clear' },
        ...Object.entries(FILTERS).map(([k, v]) => ({ name: v, value: k })),
      ].filter(c => c.name.toLowerCase().includes(focused) || c.value.startsWith(focused));
      await interaction.respond(choices.slice(0, 25));
    },

    async execute(interaction) {
      if (!hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const name = interaction.options.getString('name').toLowerCase();

      // ── List all filters ──
      if (name === 'list') {
        const active = queue.filters.names;
        const lines = Object.entries(FILTERS).map(([k, v]) =>
          `${active.includes(k) ? '✅' : '⬜'} \`${k.padEnd(12)}\` ${v}`
        ).join('\n');
        return interaction.reply({
          embeds: [musicEmbed(
            '🎛️ Audio Filters',
            lines + '\n\n*✅ = currently active • Toggle with `/filter <name>`*',
            COLORS.FILTER
          )],
        });
      }

      // ── Clear all ──
      if (name === 'clear') {
        await queue.filters.clear();
        return interaction.reply({ embeds: [successEmbed('All audio filters cleared!')] });
      }

      // ── Unknown ──
      if (!FILTERS[name]) {
        return interaction.reply({
          embeds: [errorEmbed(`Unknown filter: **${name}**\nUse \`/filter list\` to see available filters.`)],
        });
      }

      // ── Toggle ──
      const active = queue.filters.names;
      if (active.includes(name)) {
        await queue.filters.remove(name);
        return interaction.reply({ embeds: [successEmbed(`**${FILTERS[name]}** filter **disabled**.`)] });
      } else {
        await queue.filters.add(name);
        return interaction.reply({ embeds: [successEmbed(`**${FILTERS[name]}** filter **enabled**! 🎛️`)] });
      }
    },
  },

  // ── /bassboost ──────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('bassboost')
      .setDescription('🔈 Quick bass boost presets')
      .addStringOption(o =>
        o.setName('level').setDescription('Boost level').setRequired(true)
          .addChoices(
            { name: '❌ Off',      value: 'off'     },
            { name: '🟡 Low',     value: 'low'     },
            { name: '🟠 Medium',  value: 'medium'  },
            { name: '🔴 High',    value: 'high'    },
            { name: '💀 Extreme', value: 'extreme' },
          )
      ),

    async execute(interaction) {
      if (!hasDjPermission(interaction)) return;
      const queue = queueExists(interaction);
      if (!queue) return;

      const level = interaction.options.getString('level');
      const active = queue.filters.names;

      // Remove existing bass
      if (active.includes('bassboost')) await queue.filters.remove('bassboost');
      if (active.includes('subboost'))  await queue.filters.remove('subboost');

      const msgs = {
        off:     'Bass boost **disabled**.',
        low:     '🟡 **Low** bass boost active.',
        medium:  '🟠 **Medium** bass boost active — feel the rhythm!',
        high:    '🔴 **High** bass boost active — your ears will thank you later.',
        extreme: '💀 **EXTREME** bass boost active — speaker warranty voided.',
      };

      if (level !== 'off') {
        await queue.filters.add('bassboost');
        if (level === 'high' || level === 'extreme') await queue.filters.add('subboost');
      }

      await interaction.reply({ embeds: [successEmbed(msgs[level])] });
    },
  },
];
