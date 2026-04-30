const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../../config.js');

module.exports = {
    name: 'report',
    description: 'Signaler un utilisateur',
    async execute(client, message, args) {
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply("Vous devez mentionner un utilisateur à signaler.");
        }
        const reason = args.slice(1).join(' ') || 'Aucune raison fournie';

        const reportChannelId = config.reportChannelId;
        const reportChannel = message.guild.channels.cache.get(reportChannelId);
        if (!reportChannel) {
            return message.reply("Le canal de signalement n'est pas configuré correctement.");
        }
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Nouveau signalement')
            .addFields(
                { name: 'Utilisateur signalé', value: `${target.user.tag} (${target.id})`, inline: true },
                { name: 'Signalé par', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Raison', value: reason, inline: false },
            )
            .setTimestamp();
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`report_action_${target.id}`)
                    .setLabel('Prendre en charge')
                    .setStyle(ButtonStyle.Primary)
            );
        await reportChannel.send({ embeds: [embed], components: [row] });
        return message.reply("Merci pour votre signalement, les modérateurs vont l'examiner.");
    }
};