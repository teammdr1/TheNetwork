const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "roblox-profile",
    description: "Affiche le profil d’un utilisateur Roblox",

    async execute(client, message, args) {
        if (!args[0]) {
            return message.reply(
                "❌ Utilisation : `+roblox-profile <username>`",
            );
        }

        const username = args[0];

        try {
            // 1. Username → ID
            const userRes = await fetch(
                "https://users.roblox.com/v1/usernames/users",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "DiscordBot",
                    },
                    body: JSON.stringify({
                        usernames: [username],
                        excludeBannedUsers: false,
                    }),
                },
            );

            const userData = await userRes.json();

            if (!userData.data || !userData.data[0]) {
                return message.reply("❌ Utilisateur introuvable.");
            }

            const userId = userData.data[0].id;

            // 2. Infos profil
            const profileRes = await fetch(
                `https://users.roblox.com/v1/users/${userId}`,
            );
            const profile = await profileRes.json();

            // 3. Avatar
            const avatarRes = await fetch(
                `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`,
            );

            const avatarData = await avatarRes.json();
            const avatar = avatarData?.data?.[0]?.imageUrl || null;

            // 4. Embed
            const embed = new EmbedBuilder()
                .setTitle(`Profil Roblox : ${profile.name}`)
                .setURL(`https://www.roblox.com/users/${userId}/profile`)
                .setColor("#ffee00")
                .setThumbnail(avatar)
                .addFields(
                    { name: "🆔 ID", value: `${profile.id}`, inline: true },
                    {
                        name: "👤 Display Name",
                        value: profile.displayName || "Aucun",
                        inline: true,
                    },
                    {
                        name: "📅 Créé le",
                        value: `<t:${Math.floor(new Date(profile.created).getTime() / 1000)}:D>`,
                        inline: true,
                    },
                    {
                        name: "📝 Bio",
                        value: profile.description || "Aucune description",
                    },
                )
                .setFooter({ text: "Roblox" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            return message.reply(
                "❌ Erreur lors de la récupération du profil.",
            );
        }
    },
};
