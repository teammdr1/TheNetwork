const {
    AuditLogEvent,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');
const { sendLog } = require('../utils/logHelper');

module.exports = {
    name: 'messageDelete',
    async execute(message, client) {
        if (!message.guild || message.author?.bot) return;
        if (!message.content && message.attachments.size === 0) return;

        let executor = null;
        try {
            await new Promise(r => setTimeout(r, 600));
            const logs = await message.guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete, limit: 1 });
            const entry = logs.entries.first();
            if (entry && entry.target?.id === message.author?.id && Date.now() - entry.createdTimestamp < 5000)
                executor = entry.executor;
        } catch {}

        const container = new ContainerBuilder().setAccentColor(0xED4245);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## 🗑️ Message Supprimé')
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));

        const section = new SectionBuilder();
        section.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**👤 Auteur :** ${message.author ? `${message.author.tag} \`${message.author.id}\`` : 'Inconnu'}\n` +
                `**📌 Salon :** ${message.channel}\n` +
                `**🛠️ Supprimé par :** ${executor ? executor.tag : "L'auteur lui-même"}`
            )
        );
        if (message.author?.displayAvatarURL) {
            section.setThumbnailAccessory(
                new ThumbnailBuilder().setURL(message.author.displayAvatarURL({ dynamic: true }))
            );
        }
        container.addSectionComponents(section);

        if (message.content) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**📝 Contenu**\n${message.content.slice(0, 1000) || '*Vide*'}`
                )
            );
        }
        if (message.attachments.size > 0) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**📎 Fichiers**\n${message.attachments.map(a => a.url).join('\n').slice(0, 500)}`
                )
            );
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`)
        );

        await sendLog(message.guild, 'messages', container);
    }
};
