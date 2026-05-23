/**
 * src/commands/settings.js
 * Server configuration: 24/7 mode, DJ role, AI Speaker, settings overview
 */
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, musicEmbed, COLORS } = require('../utils/embeds');

module.exports = [

  // ── /247 ────────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('247')
      .setDescription('🔒 Toggle 24/7 mode — bot stays in VC even when empty')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const s = interaction.client.settings.get(interaction.guild.id) ?? {};
      s.alwaysOn = !s.alwaysOn;
      interaction.client.settings.set(interaction.guild.id, s);

      if (s.alwaysOn) {
        await interaction.reply({ embeds: [successEmbed('**24/7 mode enabled** 🔒 — I will stay in the voice channel forever!')] });
      } else {
        await interaction.reply({ embeds: [successEmbed('**24/7 mode disabled** — I will leave when the channel is empty.')] });
      }
    },
  },

  // ── /djrole ─────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('djrole')
      .setDescription('🎧 Set or remove the DJ role required to control music')
      .addRoleOption(o =>
        o.setName('role').setDescription('Role to assign as DJ (leave blank to clear)')
      )
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      const role = interaction.options.getRole('role');
      const s = interaction.client.settings.get(interaction.guild.id) ?? {};

      if (!role) {
        delete s.djRole;
        interaction.client.settings.set(interaction.guild.id, s);
        return interaction.reply({ embeds: [successEmbed('DJ role **cleared** — everyone can now control music.')] });
      }

      s.djRole = role.id;
      interaction.client.settings.set(interaction.guild.id, s);
      await interaction.reply({ embeds: [successEmbed(`DJ role set to <@&${role.id}> 🎧\nOnly members with this role (or Admins) can use music controls.`)] });
    },
  },

  // ── /aispeaker ──────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('aispeaker')
      .setDescription('🤖 Toggle AI DJ — Claude announces and hypes each song')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
      if (!process.env.ANTHROPIC_API_KEY) {
        return interaction.reply({
          embeds: [errorEmbed(
            'No `ANTHROPIC_API_KEY` found in your `.env` file.\n' +
            'Get a key at [console.anthropic.com](https://console.anthropic.com) and add it to enable AI Speaker.'
          )],
          ephemeral: true,
        });
      }

      const s = interaction.client.settings.get(interaction.guild.id) ?? {};
      s.aiSpeaker = !s.aiSpeaker;
      interaction.client.settings.set(interaction.guild.id, s);

      if (s.aiSpeaker) {
        await interaction.reply({ embeds: [successEmbed('🤖 **AI DJ Speaker enabled!**\nClaude will hype up every song that plays!')] });
      } else {
        await interaction.reply({ embeds: [successEmbed('AI DJ Speaker **disabled**.')] });
      }
    },
  },

  // ── /settings ───────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('settings')
      .setDescription('⚙️ View the current bot settings for this server'),
    async execute(interaction) {
      const s = interaction.client.settings.get(interaction.guild.id) ?? {};

      const embed = musicEmbed(
        '⚙️ Server Settings',
        [
          `**24/7 Mode:**   ${s.alwaysOn  ? '✅ Enabled' : '❌ Disabled'}`,
          `**DJ Role:**     ${s.djRole    ? `<@&${s.djRole}>` : 'Not set (everyone can control)'}`,
          `**AI Speaker:**  ${s.aiSpeaker ? '✅ Enabled' : '❌ Disabled'}`,
        ].join('\n'),
        COLORS.PRIMARY
      ).setFooter({ text: interaction.guild.name });

      await interaction.reply({ embeds: [embed] });
    },
  },

  // ── /help ───────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('❓ Show all available commands'),
    async execute(interaction) {
      const embed = musicEmbed(
        '🎵 PremiumBeats — Command List',
        [
          '**🎵 Music**',
          '`/play` · `/search` · `/nowplaying` · `/seek`',
          '',
          '**⏯️ Playback**',
          '`/skip` · `/pause` · `/resume` · `/stop` · `/volume` · `/loop` · `/shuffle`',
          '',
          '**📋 Queue**',
          '`/queue` · `/remove` · `/clear` · `/move` · `/jump`',
          '',
          '**🎛️ Audio Filters**',
          '`/filter` · `/bassboost`',
          '',
          '**⚙️ Server Settings** *(Manage Server required)*',
          '`/247` · `/djrole` · `/aispeaker` · `/settings`',
        ].join('\n'),
        COLORS.PRIMARY
      ).setFooter({ text: 'PremiumBeats v2 • Powered by DisTube + Claude AI' });

      await interaction.reply({ embeds: [embed] });
    },
  },
];
