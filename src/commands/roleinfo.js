const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'roleinfo',
    description: 'Affiche les informations d’un rôle',

    async execute(message, args) {
        if (!message.guild) return;

        // Vérifie permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply("❌ Tu n'as pas la permission de voir les rôles.");
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) return message.reply("❌ Mentionne un rôle ou mets son ID.");

        const embed = new EmbedBuilder()
            .setTitle(`ℹ️ Infos sur le rôle : ${role.name}`)
            .setColor(role.color || '#5865F2')
            .addFields(
                { name: 'ID', value: `\`${role.id}\``, inline: true },
                { name: 'Couleur', value: `#${role.color.toString(16).padStart(6,'0')}`, inline: true },
                { name: 'Mentionable', value: role.mentionable ? '✅ Oui' : '❌ Non', inline: true },
                { name: 'Hoist (affiché séparément)', value: role.hoist ? '✅ Oui' : '❌ Non', inline: true },
                { name: 'Position', value: `${role.position}`, inline: true },
                { name: 'Nombre de membres', value: `${role.members.size}`, inline: true },
                { name: 'Permissions', value: role.permissions.toArray().join(', ') || 'Aucune' }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};