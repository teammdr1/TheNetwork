const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "serverinfo",
    description: "Afficher les informations du serveur",
    async execute(client, message, args) {
        const { guild } = message;
        const embed = new EmbedBuilder()
            .setTitle(`Informations sur ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: guild.id, inline: true },
                { name: 'Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Région', value: guild.preferredLocale, inline: true },
                { name: 'Membres', value: `${guild.memberCount}`, inline: true },
                { name: 'Canaux', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Rôles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Créé le',
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
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
