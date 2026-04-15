const guildConfig = require('../utils/guildConfig');

module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (!interaction.guild) return;

        try {
            if (interaction.customId === "enable_captcha") {
                guildConfig.set(interaction.guild.id, 'captchaEnabled', true);
                await interaction.reply({ content: "✅ Captcha activé pour ce serveur", ephemeral: true });
            }

            if (interaction.customId === "enable_antiraid") {
                guildConfig.set(interaction.guild.id, 'antiraidEnabled', true);
                await interaction.reply({ content: "🚨 Anti-Raid activé pour ce serveur", ephemeral: true });
            }
        } catch (err) {
            console.log(`Erreur interaction bouton: ${err.message}`);
        }
    }
};
