const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rolelist',
    description: 'Liste tous les rôles du serveur',

    async execute(message) {
        if (!message.guild) return;

        const roles = message.guild.roles.cache
            .sort((a,b) => b.position - a.position)
            .map(r => r.toString())
            .join(', ');

        const embed = new EmbedBuilder()
            .setTitle(`📜 Liste des rôles - ${message.guild.name}`)
            .setDescription(roles || 'Aucun rôle')
            .setColor('#5865F2')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};