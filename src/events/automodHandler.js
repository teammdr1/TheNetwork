const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');

const fs = require('fs');
const path = require('path');
const { getAutomod, isWhitelisted } = require('../utils/automodConfig');
const { sendLog } = require('../utils/logHelper');

// ─── Regex ───
const INVITE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:discord(?:app)?\.(?:gg|com\/invite)\/[a-zA-Z0-9-]+)/gi;
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>\"]{2,}/gi;

// ─── Warnings ───
const WARNINGS_FILE = path.join(__dirname, '../../data/warnings.json');

function addWarning(guildId, userId, reason) {
    let data = {};
    if (fs.existsSync(WARNINGS_FILE)) {
        try { data = JSON.parse(fs.readFileSync(WARNINGS_FILE, 'utf8')); } catch {}
    }

    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][userId]) data[guildId][userId] = [];

    data[guildId][userId].push({
        reason,
        moderator: 'AutoMod',
        timestamp: Date.now()
    });

    try {
        fs.writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2));
    } catch {}
}

// ─── Labels ───
const ACTION_COLORS = {
    delete: 0x99AAB5,
    warn:   0xFEE75C,
    mute:   0xF04747,
    kick:   0xED4245,
    ban:    0x36393F
};

const ACTION_LABELS = {
    delete: '🗑️ Message supprimé',
    warn:   '⚠️ Averti',
    mute:   '🔇 Muté 10 min',
    kick:   '👢 Expulsé',
    ban:    '🔨 Banni'
};

const MODULE_LABELS = {
    antiinvite: '🔗 Anti-Invitations',
    antilink:   '🌐 Anti-Liens',
    antiwords:  '🚫 Anti-Mots'
};

// ─── Action principale ───
async function takeAction(message, mod, moduleName, reason) {
    const { action } = mod;
    const member = message.member;
    const guild = message.guild;

    try { await message.delete(); } catch {}

    if (member) {
        if (action === 'warn') {
            addWarning(guild.id, member.id, `AutoMod (${moduleName}): ${reason}`);
            try { await member.send(`⚠️ Avertissement sur **${guild.name}**\n**Raison :** ${reason}`); } catch {}
        }

        else if (action === 'mute') {
            if (member.moderatable) {
                try {
                    await member.timeout(10 * 60 * 1000, `AutoMod: ${reason}`);
                    try { await member.send(`🔇 Muté 10 min sur **${guild.name}**\n**Raison :** ${reason}`); } catch {}
                } catch {}
            }
        }

        else if (action === 'kick') {
            if (member.kickable) {
                try { await member.send(`👢 Expulsé de **${guild.name}**\n**Raison :** ${reason}`); } catch {}
                try { await member.kick(`AutoMod: ${reason}`); } catch {}
            }
        }

        else if (action === 'ban') {
            if (member.bannable) {
                try { await member.send(`🔨 Banni de **${guild.name}**\n**Raison :** ${reason}`); } catch {}
                try {
                    await guild.members.ban(member.id, {
                        reason: `AutoMod: ${reason}`,
                        deleteMessageSeconds: 60
                    });
                } catch {}
            }
        }
    }

    const container = new ContainerBuilder().setAccentColor(ACTION_COLORS[action] || 0x99AAB5);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🛡️ AutoMod — ${MODULE_LABELS[moduleName]}`)
    );

    container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(1).setDivider(true)
    );

    const preview = (message.content || '*Vide*').slice(0, 400);

    const section = new SectionBuilder();
    section.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**👤 Membre :** ${message.author.tag} \`${message.author.id}\`\n` +
            `**📌 Salon :** <#${message.channel.id}>\n` +
            `**⚡ Action :** ${ACTION_LABELS[action] || action}\n` +
            `**🔍 Raison :** ${reason}\n\n` +
            `**📝 Message :**\n> ${preview}`
        )
    );

    section.setThumbnailAccessory(
        new ThumbnailBuilder().setURL(
            message.author.displayAvatarURL({ dynamic: true })
        )
    );

    container.addSectionComponents(section);

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `-# <t:${Math.floor(Date.now() / 1000)}:F>`
        )
    );

    if (mod.logChannelId) {
        const logCh = guild.channels.cache.get(mod.logChannelId);
        if (logCh) {
            logCh.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            }).catch(() => {});
        }
    }

    await sendLog(guild, 'moderation', container);
}

// ─── Handler ───
module.exports = {
    name: 'messageCreate',

    async execute(message, client) {
        if (!message.guild || message.author?.bot) return;
        if (!message.content?.trim()) return;
        if (!message.member) return;

        const automod = getAutomod(message.guild.id);
        const content = message.content;

        // 1. Anti-invite
        const inv = automod.antiinvite;
        if (inv?.enabled && !isWhitelisted(message, inv)) {
            if (INVITE_REGEX.test(content)) {
                await takeAction(message, inv, 'antiinvite', 'Invitation Discord détectée');
                return;
            }
        }

        // 2. Anti-link
        const al = automod.antilink;
        if (al?.enabled && !isWhitelisted(message, al)) {
            if (URL_REGEX.test(content)) {
                await takeAction(message, al, 'antilink', 'Lien URL détecté');
                return;
            }
        }
        const aw = automod.antiwords;
        if (aw?.enabled && aw.words?.length && !isWhitelisted(message, aw)) {

            const normalize = (t) =>
                (t || "")
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, " ")
                    .trim();

            const messageWords = new Set(normalize(content).split(" ").filter(Boolean));

            const found = aw.words.find(w => {
                const word = normalize(w);
                return messageWords.has(word);
            });

            if (found) {
                await takeAction(
                    message,
                    aw,
                    'antiwords',
                    `Mot banni : "${found}"`
                );
                return;
            }
        }
    }
};
