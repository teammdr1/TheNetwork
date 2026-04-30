const { EmbedBuilder } = require("discord.js");
const guildConfig = require("../../utils/guildConfig");

const categoryNames = {
  admin: '⚔️・Modération',
  avatar: '🎨・Avatars',
  config: '🛡️・Sécurité & Config',
  fun: '🎉・Fun',
  games: '🎮・Jeux',
  info: '🔍・Informations',
  music: '🎵・Musique',
  other: '🔧・Autre',
  owner: '👑・Propriétaire',
  roblox: '🎮・Roblox',
  utility: '🛠️・Utilitaires'
};

module.exports = {
  name: "onepage",
  description: "Affiche toutes les commandes en une seule page",

  async execute(client, message, args) {
    const prefix = guildConfig.get(message.guild.id, "prefix") || "+";

    // Build categories dynamically
    const categories = {};
    client.commands.forEach(cmd => {
      const cat = cmd.category || 'other';
      const catName = categoryNames[cat] || cat;
      if (!categories[catName]) categories[catName] = [];
      categories[catName].push({
        name: `${prefix}${cmd.name}`,
        description: cmd.description || 'Pas de description'
      });
    });

    const embed = new EmbedBuilder()
      .setColor("#00ff00")
      .setAuthor({
        name: `${client.user.username}`,
        iconURL: client.user.displayAvatarURL(),
      })
      .setTitle("📋 Liste complète des commandes");

    Object.entries(categories).forEach(([cat, cmds]) => {
      const value = cmds.map(c => `\`${c.name}\` - ${c.description}`).join('\n');
      if (value.length > 1024) {
        // If too long, truncate or split, but for now, just add as is, Discord will handle
        embed.addFields({ name: cat, value: value.substring(0, 1024), inline: false });
      } else {
        embed.addFields({ name: cat, value, inline: false });
      }
    });

    embed.setFooter({
      text: `Total: ${Object.values(categories).flat().length} commandes`,
      iconURL: client.user.displayAvatarURL({ dynamic: true }),
    })
    .setTimestamp();

    message.channel.send({ embeds: [embed] });
  }
};