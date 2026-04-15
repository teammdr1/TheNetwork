const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "servers",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("Permission refusée.");
    }

    let result = [];

    for (const guild of client.guilds.cache.values()) {
      try {
        const channels = guild.channels.cache.filter(
          c => c.isTextBased() && c.permissionsFor(guild.members.me).has(PermissionFlagsBits.CreateInstantInvite)
        );

        const channel = channels.first();
        if (!channel) {
          result.push(`• ${guild.name} : aucun salon accessible`);
          continue;
        }

        const invite = await channel.createInvite({
          maxAge: 0,
          maxUses: 0,
          unique: false,
          reason: "Commande servers"
        });

        result.push(`• ${guild.name} : ${invite.url}`);
      } catch (err) {
        result.push(`• ${guild.name} : impossible de générer une invite`);
      }
    }

    const chunks = [];
    while (result.length) {
      chunks.push(result.splice(0, 10).join("\n"));
    }

    for (const chunk of chunks) {
      await message.channel.send(chunk);
    }
  }
};