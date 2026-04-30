const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "invite",
  description: "Invite le bot sur votre serveur",

  async execute(client, message, args) {
    const inviteEmbed = new EmbedBuilder()
      .setTitle("Invite le bot")
      .setDescription(`Clique sur le lien suivant pour inviter le bot sur ton serveur : https://discord.com/oauth2/authorize?client_id=1492793436821131394&permissions=8&integration_type=0&scope=bot`)
      .setColor("#464ec2");

    message.reply({ embeds: [inviteEmbed] });
  },
};
