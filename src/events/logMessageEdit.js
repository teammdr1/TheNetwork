const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logHelper');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (!newMessage.guild || newMessage.author?.bot) return;
        if (!oldMessage.content || oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setTitle('✏️ Message Modifié')
            .setColor('#FEE75C')
            .setThumbnail(newMessage.author?.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Auteur', value: `${newMessage.author?.tag} \`${newMessage.author?.id}\``, inline: true },
                { name: '📌 Salon', value: `${newMessage.channel}`, inline: true },
                { name: '🔗 Lien', value: `[Voir le message](${newMessage.url})`, inline: true },
                { name: '❌ Avant', value: (oldMessage.content || '*Vide*').slice(0, 500), inline: false },
                { name: '✅ Après', value: (newMessage.content || '*Vide*').slice(0, 500), inline: false }
            )
            .setTimestamp();

        await sendLog(newMessage.guild, 'messages', embed);
    }
};
