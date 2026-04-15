const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'owner',
    async execute(message, args) {

        // Vérifie si l'auteur est le propriétaire du serveur
        if (message.guild.ownerId !== message.author.id) {
            return message.reply("Seul le propriétaire du serveur peut utiliser cette commande.");
        }

        // Vérifie la mention
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply("Mentionne un utilisateur à promouvoir.");
        }

        // IDs des rôles à attribuer (remplace par les tiens)
        const rolesToAdd = [
            '1485011452799488120', // ex: Owner
            '1485011501596147863'  // ex: Admin
        ];

        try {
            for (const roleId of rolesToAdd) {
                const role = message.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                }
            }

            message.reply(`${member.user.tag} est maintenant owner.`);
        } catch (error) {
            console.error(error);
            message.reply("Erreur lors de l'attribution des rôles.");
        }
    }
};
