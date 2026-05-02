const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');
const { sendLog } = require('../utils/logHelper');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (!newMessage.guild || newMessage.author?.bot) return;
        if (!oldMessage.content || oldMessage.content === newMessage.content) return;

        const container = new ContainerBuilder().setAccentColor(0xFEE75C);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## ✏️ Message Modifié')
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));

        const section = new SectionBuilder();
        section.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**👤 Auteur :** ${newMessage.author?.tag} \`${newMessage.author?.id}\`\n` +
                `**📌 Salon :** ${newMessage.channel}\n` +
                `**🔗 Lien :** [Voir le message](${newMessage.url})`
            )
        );
        section.setThumbnailAccessory(
            new ThumbnailBuilder().setURL(newMessage.author?.displayAvatarURL({ dynamic: true }))
        );
        container.addSectionComponents(section);
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**❌ Avant**\n${(oldMessage.content || '*Vide*').slice(0, 500)}\n\n` +
                `**✅ Après**\n${(newMessage.content || '*Vide*').slice(0, 500)}`
            )
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`)
        );

        await sendLog(newMessage.guild, 'messages', container);
    }
};
