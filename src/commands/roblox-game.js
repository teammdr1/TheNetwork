const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roblox-game',
    description: 'Affiche les informations d’un jeu Roblox',

    async execute(client, message, args) {

        if (!args[0]) {
            return message.reply("❌ Utilisation : `+roblox-game <lien-du-jeu>`");
        }

        const url = args[0];

        const match = url.match(/roblox\.com\/games\/(\d+)/);

        if (!match) {
            return message.reply("❌ Lien Roblox invalide.");
        }

        const placeId = match[1];

        try {

            // 1. placeId -> universeId
            const uniRes = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
            const uniData = await uniRes.json();

            const universeId = uniData?.universeId;

            if (!universeId) {
                return message.reply("❌ Universe introuvable.");
            }

            // 2. infos jeu
            const gameRes = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
            const gameData = await gameRes.json();

            if (!gameData?.data || !gameData.data.length) {
                return message.reply("❌ Impossible de récupérer ce jeu.");
            }

            const game = gameData.data[0];

            // 3. thumbnail sécurisé
            const thumbRes = await fetch(
                `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png`
            );

            const thumbData = await thumbRes.json();
            const thumbnail = thumbData?.data?.[0]?.imageUrl || null;

            // 4. creator safe
            const creatorName = game.creator?.name || "Inconnu";

            // 5. embed
            const embed = new EmbedBuilder()
                .setTitle(`🎮 ${game.name}`)
                .setURL(`https://www.roblox.com/games/${placeId}`)
                .setDescription(game.description || "Aucune description.")
                .setColor("#00A2FF")
                .setThumbnail(thumbnail)
                .addFields(
                    { name: "👤 Créateur", value: creatorName, inline: true },
                    { name: "🎮 Joueurs", value: `${game.playing ?? 0}`, inline: true },
                    { name: "👀 Visites", value: `${game.visits ?? 0}`, inline: true },
                    { name: "👍 Likes", value: `${game.upVotes ?? 0}`, inline: true }
                )
                .setFooter({ text: "Roblox Game Info" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply("❌ Impossible de récupérer les informations du jeu.");
        }
    }
};