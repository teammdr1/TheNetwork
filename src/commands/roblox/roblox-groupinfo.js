const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roblox-groupinfo',
    description: 'Affiche les infos d’un groupe Roblox',

    async execute(client, message, args) {

        if (!args[0]) {
            return message.reply("❌ Utilisation : `+roblox-groupinfo <groupId>`");
        }

        const groupId = args[0];

        try {
            // 1. Infos groupe
            const res = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
            const data = await res.json();

            if (!data || !data.id) {
                return message.reply("❌ Groupe introuvable.");
            }

            // 2. Icone groupe
            const thumbRes = await fetch(
                `https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupId}&size=420x420&format=Png`
            );
            const thumbData = await thumbRes.json();

            const icon = thumbData?.data?.[0]?.imageUrl || null;

            // 3. Owner (IMPORTANT FIX)
            let ownerName = "Aucun";

            if (data.owner && data.owner.userId) {
                const ownerRes = await fetch(
                    `https://users.roblox.com/v1/users/${data.owner.userId}`
                );
                const ownerData = await ownerRes.json();
                ownerName = ownerData?.name || "Inconnu";
            }

            // 4. Embed
            const embed = new EmbedBuilder()
                .setTitle(`👥 Groupe Roblox : ${data.name}`)
                .setURL(`https://www.roblox.com/groups/${groupId}`)
                .setDescription(data.description || "Aucune description")
                .setColor("#FF4500")
                .setThumbnail(icon)
                .addFields(
                    { name: "🆔 ID", value: `${data.id}`, inline: true },
                    { name: "👑 Propriétaire", value: ownerName, inline: true },
                    { name: "👥 Membres", value: `${data.memberCount}`, inline: true },
                    { name: "🌐 Public", value: data.publicEntryAllowed ? "Oui" : "Non", inline: true }
                )
                .setFooter({ text: "Roblox Group Info" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply("❌ Impossible de récupérer les infos du groupe.");
        }
    }
};
