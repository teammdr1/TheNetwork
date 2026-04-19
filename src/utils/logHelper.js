const guildConfig = require('./guildConfig');

const LOG_TYPES = {
    member:     { label: '📥 Membres',      desc: 'Arrivées et départs' },
    messages:   { label: '💬 Messages',     desc: 'Suppressions et modifications' },
    voice:      { label: '🎤 Vocal',        desc: 'Connexions, départs, déplacements' },
    roles:      { label: '🎖️ Rôles',        desc: 'Attribution et retrait de rôles' },
    boost:      { label: '🚀 Boosts',       desc: 'Boosts du serveur' },
    channels:   { label: '📋 Salons',       desc: 'Création, suppression, modification' },
    moderation: { label: '🔨 Modération',   desc: 'Bans, kicks, mutes, warns' },
    server:     { label: '🌐 Serveur',      desc: 'Mises à jour du serveur' }
};

async function sendLog(guild, type, embed) {
    try {
        const cfg = guildConfig.getAll(guild.id);
        const channels = cfg.logChannels || {};
        const channelId = channels[type] || null;
        if (!channelId) return;
        const channel = guild.channels.cache.get(channelId);
        if (!channel) return;
        await channel.send({ embeds: [embed] });
    } catch {}
}

module.exports = { sendLog, LOG_TYPES };
