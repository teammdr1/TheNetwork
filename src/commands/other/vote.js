// src/commands/vote.js
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "vote",
  description: "Affiche le lien pour voter pour le bot",
  async execute(client, message, args) {
    // 🔗 Remplace par ton vrai lien (Top.gg ou autre)
    const voteURL = "https://top.gg/bot/1485013817770643699/vote";

    const embed = new EmbedBuilder()
      .setTitle("Soutenir le bot")
      .setDescription(
        "Tu peux soutenir le bot gratuitement en votant !\n\n" +
          "• Ça aide à le rendre plus visible\n" +
          "• Ça soutient le développement\n" +
          "• Ça prend 5 secondes\n\n" +
          "Clique sur le bouton ci-dessous pour voter.",
      )
      .setColor(0x5865f2)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ text: `Merci pour ton soutien` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Voter pour le bot")
        .setStyle(ButtonStyle.Link)
        .setURL(voteURL),
    );

    message.channel.send({
      embeds: [embed],
      components: [row],
    });
  },
};
