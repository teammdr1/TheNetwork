const { EmbedBuilder } = require('discord.js');
const config = require('../../../config.js');

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = class SteamCommand {
  constructor(client) {
    this.name = 'steam';
    this.description = 'Rechercher un jeu sur Steam.';
  }

  async run(message, args) {
    try {
      const query = args.join(' ');

      if (!query) {
        return message.reply('Utilisation: steam <nom du jeu>');
      }

      const searchRes = await fetch(
        `https://store.steampowered.com/api/storesearch?cc=fr&l=fr&term=${encodeURIComponent(query)}`
      );

      const search = await searchRes.json();

      if (!search || !search.items || !search.items.length) {
        return message.channel.send(`Aucun résultat pour **${query}**`);
      }

      const game = search.items[0];

      if (!game || !game.id) {
        return message.channel.send("Impossible de récupérer les infos du jeu.");
      }

      const detailsRes = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${game.id}`
      );

      const detailsJson = await detailsRes.json();
      const data = detailsJson[game.id]?.data;

      if (!data) {
        return message.channel.send("Impossible de récupérer les infos du jeu.");
      }

      const price =
        data.price_overview
          ? `${(data.price_overview.final / 100).toFixed(2)}€`
          : 'Gratuit';

      const platforms = [];
      if (data.platforms?.windows) platforms.push('Windows');
      if (data.platforms?.mac) platforms.push('Mac');
      if (data.platforms?.linux) platforms.push('Linux');

      const embed = new EmbedBuilder()
        .setColor('#2f3136')
        .setTitle(data.name)
        .setURL(`https://store.steampowered.com/app/${data.steam_appid}`)
        .setDescription(data.short_description || 'Aucune description.')
        .setThumbnail(game.tiny_image)
        .addFields(
          { name: 'Prix', value: price, inline: true },
          { name: 'Plateformes', value: platforms.join(', ') || 'Aucune', inline: true },
          { name: 'Métascore', value: data.metacritic?.score?.toString() || 'N/A', inline: true },
          { name: 'Sortie', value: data.release_date?.date || 'Inconnue', inline: true },
          { name: 'Développeurs', value: data.developers?.join(', ') || 'N/A', inline: true },
          { name: 'Éditeurs', value: data.publishers?.join(', ') || 'N/A', inline: true }
        )
        .setFooter({ text: config.footer || 'Steam' });

      return message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return message.channel.send("Erreur lors de la recherche Steam.");
    }
  }
};