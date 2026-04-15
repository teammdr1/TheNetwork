const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const PREVNAMES_FILE = path.join(__dirname, "../../data/prevnames.json");

module.exports = {
  name: "prevnames",
  description: "Affiche les anciens pseudos d'un membre",
  async execute(client, message, args) {
    const member = message.mentions.members.first() || message.member;
    let data = {};
    if (fs.existsSync(PREVNAMES_FILE)) {
      data = JSON.parse(fs.readFileSync(PREVNAMES_FILE, "utf8"));
    }
    const guildId = message.guild.id;
    const history = data[guildId]?.[member.id];
    if (!history || history.length === 0) {
      return message.reply(`${member.user.tag} n'a pas d'historique de pseudo sur ce serveur.`);
    }
    const list = history
      .map(h => `• ${h.name} - <t:${Math.floor(h.date / 1000)}:R>`)
      .reverse()
      .join("\n");
    const embed = new EmbedBuilder()
      .setTitle(`Historique des pseudos de ${member.user.tag}`)
      .setDescription(list)
      .setColor(0x00ff00)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Demandé par ${message.author.tag}` })
      .setTimestamp();
    message.channel.send({ embeds: [embed] });
  }
};
