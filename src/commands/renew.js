const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "renew",
  description: "Supprime et recrée un salon textuel",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("Vous n'avez pas la permission de gérer les salons.");
    }

    const channel = message.mentions.channels.first() || message.channel;
    if (!channel || channel.type !== 0) return message.reply("Salon textuel invalide.");

    const clone = await channel.clone({ reason: `Salon renouvelé par ${message.author.tag}` });
    await channel.delete();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`Salon ${clone} recréé avec succès !`);
    message.channel.send({ embeds: [embed] });
  }
};
