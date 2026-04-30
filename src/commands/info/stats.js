const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const STATS_FILE = path.join(__dirname, "../data/messageStats.json");

// Charger les stats
function loadStats() {
  if (!fs.existsSync(STATS_FILE)) return {};
  return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
}

module.exports = {
  name: "stats",
  description: "Affiche les messages et top salon d'un membre",
  async execute(client, message, args) {
    const member = message.mentions.members.first() || message.member;
    const stats = loadStats();
    const memberStats = stats[member.id] || { total: 0, channels: {} };

    // Trouver le top salon
    let topChannel = "Aucun";
    if (memberStats.channels && Object.keys(memberStats.channels).length > 0) {
      const sorted = Object.entries(memberStats.channels).sort((a,b) => b[1]-a[1]);
      topChannel = `<#${sorted[0][0]}> (${sorted[0][1]} messages)`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`📊 Statistiques de ${member.user.tag}`)
      .addFields(
        { name: "Messages envoyés", value: `${memberStats.total}`, inline: true },
        { name: "Top salon", value: topChannel, inline: true }
      )
      .setColor(0x2b2d31);

    message.channel.send({ embeds: [embed] });
  }
};
