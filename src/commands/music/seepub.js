const { EmbedBuilder } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'seepub',
    description: 'Affiche la publicité/présentation du serveur',
    async execute(client, message, args) {
        const cfg = guildConfig.getAll(message.guild.id);
        const description = cfg.serverDescription;

        if (!description) {
            return message.reply('❌ Aucune description configurée. Utilisez `+setdesc <texte>` pour en définir une.');
        }

        const embed = new EmbedBuilder()
            .setTitle(`📢 Publicité — ${message.guild.name}`)
            .setDescription(description)
            .setColor('#00ff15')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });
        message.channel.send({ embeds: [embed] });
    }
};
