const { EmbedBuilder } = require('discord.js');
const config = require('../../../config.js');

module.exports = {
  name: 'insta',

  async execute(client, message, args) {
    try {
      const name = args.join(' ');

      if (!name) {
        const msg = await message.reply("Tu dois entrer un nom Instagram.");
        setTimeout(() => msg.delete().catch(() => {}), 5000);
        return;
      }

      const url = `https://instagram.com/${name}/?__a=1`;

      let res;
      try {
        res = await fetch(url).then(r => r.json());
      } catch {
        return message.reply("Compte introuvable.");
      }

      const account = res.graphql.user;

      const embed = new EmbedBuilder()
        .setColor('#2f3136')
        .setTitle(account.full_name)
        .setURL(`https://instagram.com/${name}`)
        .setThumbnail(account.profile_pic_url_hd)
        .setDescription('Informations sur le profil')
        .addFields(
          { name: 'Nom', value: account.username, inline: true },
          { name: 'Pseudo', value: account.full_name || 'Aucun', inline: true },
          { name: 'Biographie', value: account.biography?.length ? account.biography : 'Aucune', inline: false },
          { name: 'Posts', value: String(account.edge_owner_to_timeline_media.count), inline: true },
          { name: 'Abonnés', value: String(account.edge_followed_by.count), inline: true },
          { name: 'Abonnements', value: String(account.edge_follow.count), inline: true },
          { name: 'Compte privé', value: account.is_private ? 'Oui 🔐' : 'Non 🔓', inline: true }
        )
        .setFooter({ text: config.footer })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      return message.reply(`Erreur: ${err.message}`);
    }
  }
};