const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'perm',
    description: 'Affiche les permissions d’un membre ou d’un rôle',

    async execute(client, message, args) {
        if (!message.guild) return;

        await message.guild.members.fetch();

        // Vérifie si mention membre
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        let permissions;

        if (member) {
            permissions = member.permissions.toArray();
            const embed = new EmbedBuilder()
                .setTitle(`🔑 Permissions de ${member.user.tag}`)
                .setDescription(permissions.join(', ') || 'Aucune')
                .setColor('#5865F2')
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        // Sinon, check un rôle
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply("❌ Mentionne un membre ou un rôle.");

        permissions = role.permissions.toArray();
        const embed = new EmbedBuilder()
            .setTitle(`🔑 Permissions du rôle : ${role.name}`)
            .setDescription(permissions.join(', ') || 'Aucune')
            .setColor(role.color || '#5865F2')
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};