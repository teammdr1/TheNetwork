const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'notifs',
    description: 'Affiche un message concernant les rôles du serveur',
    async execute(client, message, args) {
        const embed = new EmbedBuilder()
            .setTitle(`🎭 Comment obtenir des rôles sur ${message.guild.name} ?`)
            .setDescription(`Pour modifier vos rôles, rendez-vous dans la section **Channels & Roles** du serveur : <id:customize>\n\nCliquez sur les différentes options pour obtenir les rôles qui vous correspondent !`)
            .setColor('#fffb00')
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });
        message.channel.send({ embeds: [embed] });
    }
};
