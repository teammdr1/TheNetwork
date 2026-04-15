const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: "Afficher les informations d'un utilisateur",
    async execute(client, message, args) {
        let user;

        if (args.length > 0) {
            const mention = message.mentions.users.first();

            if (mention) {
                user = mention;
            } else {
                const userId = args[0];
                try {
                    user = await client.users.fetch(userId);
                } catch {
                    return message.channel.send("❌ Utilisateur non trouvé.");
                }
            }
        } else {
            user = message.author;
        }

        const member = await message.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`Informations sur ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: user.id, inline: true },
                { name: "Nom d'utilisateur", value: user.username, inline: true },
                { name: 'Surnom', value: member.nickname ?? 'Aucun', inline: true },
                {
                    name: 'Compte créé le',
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
                    inline: false
                },
                {
                    name: 'Rejoint le serveur le',
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                    inline: false
                },
                {
                    name: 'Rôles',
                    value: member.roles.cache
                        .filter(role => role.name !== '@everyone')
                        .map(role => role.name)
                        .join(', ') || 'Aucun',
                    inline: false
                }
            )
            .setColor(0x00FF00)
            .setFooter({
                text: `Demandé par ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            });

        await message.channel.send({ embeds: [embed] });
    }
};
