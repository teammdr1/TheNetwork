const { EmbedBuilder } = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'soutien',
    description: 'Comment soutenir le serveur',
    async execute(client, message, args) {
        const cfg = guildConfig.getAll(message.guild.id);
        const roleMention = cfg.soutienRoleId ? `<@&${cfg.soutienRoleId}>` : 'le rôle soutien';
        const statut = cfg.soutienStatut || 'le statut configuré';
        const guildName = message.guild.name;

        const embed = new EmbedBuilder()
            .setTitle(`🎀 Soutenir ${guildName}`)
            .setDescription(`✨ Tu apprécies le serveur et tu veux nous soutenir ? Voici comment ! ✨

💖 **Mettre \`${statut}\` dans ton statut** pour obtenir le rôle exclusif ${roleMention} : un petit geste qui aide énormément à faire connaître le serveur !

🌟 **Mettre le tag du serveur** : représente-nous partout sur Discord.

🚀 **Booster le serveur** : obtiens des avantages exclusifs (permissions, rôle personnalisé, etc.)

🙏 Merci à tous ceux qui soutiennent le serveur ! :sparkling_heart:`)
            .setThumbnail(message.guild.iconURL({ dynamic: true, size: 1024 }))
            .setColor('#fffb00')
            .setFooter({ text: guildName, iconURL: message.guild.iconURL({ dynamic: true }) });
        message.channel.send({ embeds: [embed] });
    }
};
