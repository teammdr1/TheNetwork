// src/commands/github.js
const { EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  name: "github",
  description: "Affiche les informations d'un profil GitHub",
  async execute(client, message, args) {
    const username = args[0];
    if (!username) {
      return message.reply("Veuillez fournir un nom d'utilisateur GitHub !");
    }
    const url = `https://api.github.com/users/${username}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return message.reply("Utilisateur GitHub introuvable !");
      }

      const data = await res.json();
      let orgsList = "Aucune";
      try {
        const orgsRes = await fetch(data.organizations_url);
        if (orgsRes.ok) {
          const orgs = await orgsRes.json();
          if (orgs.length > 0) orgsList = orgs.map(org => org.login).join(", ");
        }
      } catch (err) {
        orgsList = "Aucune";
      }
      const embed = new EmbedBuilder()
        .setTitle(`Profil GitHub de ${data.login || "Inconnu"}`)
        .setURL(data.html_url)
        .setThumbnail(data.avatar_url)
        .setColor(0x24292F) // couleur GitHub
        .addFields(
          { name: "Informations basiques", value: "\u200B" },
          { name: "Utilisateur", value: data.login || "Inconnu", inline: true },
          { name: "Entreprise", value: data.company || "Aucune", inline: true },
          { name: "Localisation", value: data.location || "Aucune", inline: true },
          { name: "Bio", value: data.bio || "Aucune", inline: false },
          { name: "Email", value: data.email || "Aucune", inline: true },
          { name: "Organisations", value: orgsList, inline: true },
          { name: "\u200B", value: "\u200B" },
          { name: "Statistiques du compte", value: "\u200B" },
          { name: "Repositories", value: data.public_repos?.toString() || "0", inline: true },
          { name: "Abonnés", value: data.followers?.toString() || "0", inline: true },
          { name: "Abonnements", value: data.following?.toString() || "0", inline: true },
          { name: "\u200B", value: "\u200B" },
          { name: "Date de création & liens", value: "\u200B" },
          { name: "Compte créé le", value: `<t:${Math.floor(new Date(data.created_at).getTime() / 1000)}:F>`, inline: true },
          { name: "Dernière mise à jour", value: `<t:${Math.floor(new Date(data.updated_at).getTime() / 1000)}:F>`, inline: true },
          { name: "Lien GitHub", value: data.html_url || "Aucun", inline: false }
        )
        .setFooter({ text: `Demandé par ${message.author.tag}` })
        .setTimestamp();
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      message.reply("Une erreur est survenue lors de la récupération du profil GitHub.");
    }
  },
};
