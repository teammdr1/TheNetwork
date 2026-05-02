const {
    MessageFlags,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
} = require('discord.js');
const guildConfig = require('../../utils/guildConfig');
const { getAutomod, setModuleField, isManager, ACTION_LABELS, MODULE_INFO } = require('../../utils/automodConfig');

function buildDashboard(automod, guild) {
    const container = new ContainerBuilder().setAccentColor(0x5865F2);
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## 🛡️ AutoMod — Tableau de bord\n*${guild.name}*`)
    );
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));

    const lines = [];
    for (const [key, info] of Object.entries(MODULE_INFO)) {
        const mod = automod[key];
        const status = mod.enabled ? '✅ Activé' : '❌ Désactivé';
        const action = ACTION_LABELS[mod.action] || mod.action;
        const wlCount = (mod.whitelistRoles?.length || 0) + (mod.whitelistChannels?.length || 0) + (mod.whitelistUsers?.length || 0);
        let line = `**${info.emoji} ${info.label}**\n> ${status} · ${action}`;
        if (key === 'antiwords') line += ` · ${mod.words?.length || 0} mot(s)`;
        if (wlCount > 0) line += ` · ${wlCount} exemption(s)`;
        lines.push(line);
    }

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(lines.join('\n\n'))
    );
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            '-# Utilisez les boutons pour activer/désactiver · `+antiinvite`, `+antilink`, `+antiwords` pour configurer'
        )
    );
    return container;
}

module.exports = {
    name: 'automod',
    description: 'Tableau de bord de la modération automatique',
    async execute(client, message, args) {
        const automod = getAutomod(message.guild.id);
        const anyMod = automod.antiinvite;
        if (!isManager(message.member, anyMod)) {
            return message.reply('❌ Permission insuffisante. (**Gérer le serveur** requis)');
        }

        const prefix = guildConfig.get(message.guild.id, 'prefix') || '+';

        function makeRows(am) {
            const invBtn = new ButtonBuilder()
                .setCustomId('automod_toggle_antiinvite')
                .setLabel(`${am.antiinvite.enabled ? '🔴 Désactiver' : '🟢 Activer'} Anti-Invites`)
                .setStyle(am.antiinvite.enabled ? ButtonStyle.Danger : ButtonStyle.Success);
            const linkBtn = new ButtonBuilder()
                .setCustomId('automod_toggle_antilink')
                .setLabel(`${am.antilink.enabled ? '🔴 Désactiver' : '🟢 Activer'} Anti-Liens`)
                .setStyle(am.antilink.enabled ? ButtonStyle.Danger : ButtonStyle.Success);
            const wordsBtn = new ButtonBuilder()
                .setCustomId('automod_toggle_antiwords')
                .setLabel(`${am.antiwords.enabled ? '🔴 Désactiver' : '🟢 Activer'} Anti-Mots`)
                .setStyle(am.antiwords.enabled ? ButtonStyle.Danger : ButtonStyle.Success);
            const closeBtn = new ButtonBuilder()
                .setCustomId('automod_close')
                .setLabel('✖ Fermer')
                .setStyle(ButtonStyle.Secondary);
            return [
                new ActionRowBuilder().addComponents(invBtn, linkBtn, wordsBtn, closeBtn)
            ];
        }

        const panelMsg = await message.channel.send({
            components: [buildDashboard(automod, message.guild), ...makeRows(automod)],
            flags: MessageFlags.IsComponentsV2
        });

        const collector = panelMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 120000
        });

        collector.on('collect', async interaction => {
            const { customId } = interaction;

            if (customId === 'automod_close') {
                await interaction.update({ components: [] });
                return collector.stop();
            }

            const moduleMap = {
                automod_toggle_antiinvite: 'antiinvite',
                automod_toggle_antilink: 'antilink',
                automod_toggle_antiwords: 'antiwords'
            };

            const mod = moduleMap[customId];
            if (!mod) return;

            const current = getAutomod(message.guild.id);
            const newState = !current[mod].enabled;
            setModuleField(message.guild.id, mod, 'enabled', newState);

            const updated = getAutomod(message.guild.id);
            await interaction.update({
                components: [buildDashboard(updated, message.guild), ...makeRows(updated)],
                flags: MessageFlags.IsComponentsV2
            });
        });

        collector.on('end', () => {
            panelMsg.edit({ components: [] }).catch(() => {});
        });
    }
};
