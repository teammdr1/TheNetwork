const { EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');
const { sendLog } = require('../utils/logHelper');

const typeNames = { 0: 'Textuel', 2: 'Vocal', 4: 'Catégorie', 5: 'Annonce', 13: 'Stage', 15: 'Forum' };

module.exports = {
    name: 'channelCreate',
    async execute(channel, client) {
        if (!channel.guild) return;
        let executor = null;
        try {
            await new Promise(r => setTimeout(r, 600));
            const logs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
            const entry = logs.entries.first();
            if (entry && Date.now() - entry.createdTimestamp < 5000) executor = entry.executor;
        } catch {}

        const embed = new EmbedBuilder()
            .setTitle('📋 Salon Créé')
            .setColor('#57F287')
            .addFields(
                { name: '📌 Salon', value: channel.type === ChannelType.GuildCategory ? `\`${channel.name}\`` : `${channel}`, inline: true },
                { name: '📂 Type', value: typeNames[channel.type] || 'Inconnu', inline: true },
                { name: '🛠️ Par', value: executor ? `${executor.tag}` : 'Inconnu', inline: true },
                { name: '🆔 ID', value: `\`${channel.id}\``, inline: true }
            )
            .setTimestamp();

        await sendLog(channel.guild, 'channels', embed);
    }
};
