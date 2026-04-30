const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roblox-avatar',
    description: 'Affiche l’avatar d’un utilisateur Roblox',

    async execute(client, message, args) {

        if (!args[0]) {
            return message.reply("❌ Utilisation : `+roblox-avatar <username>`");
        }

        const username = args[0];

        try {

            // 1. username -> userId
            const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "DiscordBot"
                },
                body: JSON.stringify({
                    usernames: [username],
                    excludeBannedUsers: false
                })
            });

            const userData = await userRes.json();

            if (!userData?.data || !userData.data[0]) {
                return message.reply("❌ Utilisateur introuvable.");
            }

            const user = userData.data[0];
            const userId = user.id;

            // 2. avatar
            const avatarRes = await fetch(
                `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=720x720&format=Png&isCircular=false`
            );

            const avatarData = await avatarRes.json();
            const avatarUrl = avatarData?.data?.[0]?.imageUrl;

            if (!avatarUrl) {
                return message.reply("❌ Impossible de récupérer l’avatar.");
            }

            // 3. embed
            const embed = new EmbedBuilder()
                .setTitle(`🖼️ Avatar Roblox : ${user.name}`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setImage(avatarUrl)
                .setColor("#ffe000")
                .setFooter({ text: "Roblox Avatar" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply("❌ Impossible de récupérer l’avatar.");
        }
    }
};
