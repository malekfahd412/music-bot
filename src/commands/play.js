/**
 * src/commands/play.js
 * /play  — play a song or playlist from any source
 * /search — search YouTube and pick from results
 */
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { inVoiceChannel } = require('../utils/helpers');
const { errorEmbed, COLORS } = require('../utils/embeds');

module.exports = [
  // ── /play ───────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('🎵 Play a song or playlist — YouTube, Spotify, SoundCloud, or direct URL')
      .addStringOption(opt =>
        opt.setName('query')
          .setDescription('Song name, YouTube/Spotify/SoundCloud URL, or direct MP3 link')
          .setRequired(true)
      ),

    async execute(interaction) {
      if (!inVoiceChannel(interaction)) return;
      const query = interaction.options.getString('query');
      await interaction.deferReply();

      try {
        await interaction.client.distube.play(
          interaction.member.voice.channel,
          query,
          { member: interaction.member, textChannel: interaction.channel, interaction }
        );
        // DisTube fires addSong/playSong events which send their own embeds
        // Only edit reply if it wasn't handled
        if (!interaction.replied) {
          await interaction.editReply({ content: `🎵 Loading **${query}**...` });
        }
      } catch (err) {
        console.error('[/play]', err.message);
        await interaction.editReply({ embeds: [errorEmbed(`Could not play that.\n\`\`\`${err.message}\`\`\``)] });
      }
    },
  },

  // ── /search ─────────────────────────────────────────────────────────────────
  {
    data: new SlashCommandBuilder()
      .setName('search')
      .setDescription('🔍 Search YouTube for a song and choose from the top 5 results')
      .addStringOption(opt =>
        opt.setName('query').setDescription('What do you want to search for?').setRequired(true)
      ),

    async execute(interaction) {
      if (!inVoiceChannel(interaction)) return;
      const query = interaction.options.getString('query');
      await interaction.deferReply();

      try {
        const results = await interaction.client.distube.search(query, { limit: 5, type: 'video' });
        if (!results?.length) return interaction.editReply({ embeds: [errorEmbed('No results found.')] });

        const embed = new EmbedBuilder()
          .setColor(COLORS.PRIMARY)
          .setTitle(`🔍 Results for: ${query}`)
          .setDescription(
            results.map((r, i) =>
              `**${i + 1}.** [${r.name}](${r.url}) — \`${r.formattedDuration}\`\n` +
              `　👤 ${r.uploader?.name ?? 'Unknown'}`
            ).join('\n\n')
          )
          .setFooter({ text: 'Pick a song — expires in 30s' });

        const row = new ActionRowBuilder().addComponents(
          results.map((_, i) =>
            new ButtonBuilder()
              .setCustomId(`search_${i}`)
              .setLabel(`${i + 1}`)
              .setStyle(ButtonStyle.Primary)
          )
        );

        const reply = await interaction.editReply({ embeds: [embed], components: [row] });

        const col = reply.createMessageComponentCollector({
          filter: i => i.user.id === interaction.user.id && i.customId.startsWith('search_'),
          time: 30_000, max: 1,
        });

        col.on('collect', async i => {
          const idx = parseInt(i.customId.split('_')[1]);
          const song = results[idx];
          await i.update({ content: `▶️ Loading **${song.name}**...`, embeds: [], components: [] });
          await interaction.client.distube.play(
            interaction.member.voice.channel,
            song.url,
            { member: interaction.member, textChannel: interaction.channel }
          );
        });

        col.on('end', (_, reason) => {
          if (reason === 'time') {
            interaction.editReply({ content: '⌛ Search timed out.', embeds: [], components: [] }).catch(() => {});
          }
        });
      } catch (err) {
        console.error('[/search]', err.message);
        await interaction.editReply({ embeds: [errorEmbed(err.message)] });
      }
    },
  },
];
