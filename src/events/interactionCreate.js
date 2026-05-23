/**
 * src/events/interactionCreate.js
 * Routes slash commands and autocomplete interactions
 */
const { errorEmbed } = require('../utils/embeds');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    // ── Autocomplete ───────────────────────────────────────────────────────
    if (interaction.isAutocomplete()) {
      const cmd = client.commands.get(interaction.commandName);
      if (cmd?.autocomplete) {
        try { await cmd.autocomplete(interaction); } catch {}
      }
      return;
    }

    // ── Slash Commands ─────────────────────────────────────────────────────
    if (!interaction.isChatInputCommand()) return;

    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;

    try {
      await cmd.execute(interaction);
    } catch (err) {
      console.error(`[CMD ERROR] /${interaction.commandName}:`, err.message);
      const embed = errorEmbed(`An error occurred while running this command.\n\`\`\`${err.message}\`\`\``);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed] }).catch(() => {});
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
      }
    }
  },
};
