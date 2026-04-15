const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    PermissionFlagsBits
} = require('discord.js');
const guildConfig = require('../utils/guildConfig');

// ─── Liste des permissions gérées ───
const PERM_LIST = [
    { key: 'ViewChannel',           label: '👁️ Voir le salon' },
    { key: 'SendMessages',          label: '💬 Envoyer messages' },
    { key: 'ReadMessageHistory',    label: '📖 Lire l\'historique' },
    { key: 'AddReactions',          label: '👍 Ajouter réactions' },
    { key: 'AttachFiles',           label: '📎 Joindre fichiers' },
    { key: 'EmbedLinks',            label: '🔗 Liens intégrés' },
    { key: 'UseExternalEmojis',     label: '😀 Emojis externes' },
    { key: 'MentionEveryone',       label: '📢 Mention @everyone' },
    { key: 'ManageMessages',        label: '🗑️ Gérer messages' },
    { key: 'CreatePublicThreads',   label: '🧵 Fils publics' },
    { key: 'CreatePrivateThreads',  label: '🔒 Fils privés' },
    { key: 'Connect',               label: '🔊 Connexion vocale' },
    { key: 'Speak',                 label: '🎤 Parler (vocal)' },
    { key: 'MuteMembers',           label: '🔇 Muter membres' },
    { key: 'DeafenMembers',         label: '🔕 Rendre sourd' },
    { key: 'MoveMembers',           label: '↔️ Déplacer membres' },
    { key: 'ManageChannels',        label: '📋 Gérer salons' },
    { key: 'ManageRoles',           label: '🎖️ Gérer rôles' },
    { key: 'KickMembers',           label: '👢 Expulser membres' },
    { key: 'BanMembers',            label: '🔨 Bannir membres' },
    { key: 'ManageNicknames',       label: '✏️ Gérer pseudos' },
    { key: 'ModerateMembers',       label: '⏱️ Timeout (mute)' },
    { key: 'ManageGuild',           label: '⚙️ Gérer serveur' },
    { key: 'Administrator',         label: '👑 Administrateur' },
    { key: 'ManageWebhooks',        label: '🪝 Webhooks' },
];

function isAuthorized(member) {
    const cfg = guildConfig.getAll(member.guild.id);
    return member.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
           member.permissions.has(PermissionsBitField.Flags.Administrator) ||
           (cfg.botOwners || []).includes(member.id);
}

function buildPermSelectMenu(customId) {
    const chunks = [];
    for (let i = 0; i < PERM_LIST.length; i += 25) chunks.push(PERM_LIST.slice(i, i + 25));
    return chunks.map((chunk, idx) =>
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`${customId}_${idx}`)
                .setPlaceholder(`🎯 Choisir une permission (${idx + 1}/${chunks.length})...`)
                .addOptions(chunk.map(p => ({ label: p.label, value: p.key })))
        )
    );
}

// ─── Rôle : voir les permissions ───
function buildRoleEmbed(role, page = 0) {
    const perPage = 12;
    const slice = PERM_LIST.slice(page * perPage, (page + 1) * perPage);
    const totalPages = Math.ceil(PERM_LIST.length / perPage);

    return new EmbedBuilder()
        .setTitle(`🎖️ Permissions — @${role.name}`)
        .setColor(role.hexColor || '#5865F2')
        .setDescription(
            slice.map(p => {
                const has = role.permissions.has(PermissionFlagsBits[p.key]);
                return `${has ? '✅' : '❌'} ${p.label}`;
            }).join('\n')
        )
        .setFooter({ text: `Page ${page + 1}/${totalPages} · Sélectionnez une permission pour la modifier` });
}

// ─── Channel : voir les overrides ───
function buildChannelOverrideEmbed(channel, target, overwrite) {
    const lines = PERM_LIST.map(p => {
        const flag = PermissionFlagsBits[p.key];
        if (!flag) return null;
        let state = '⬜ Hérité';
        if (overwrite?.allow.has(flag)) state = '✅ Autorisé';
        else if (overwrite?.deny.has(flag)) state = '❌ Refusé';
        return `${state} — ${p.label}`;
    }).filter(Boolean);

    const half = Math.ceil(lines.length / 2);

    return new EmbedBuilder()
        .setTitle(`🔒 Permissions — ${target.name || target.user?.tag} dans #${channel.name}`)
        .setColor('#5865F2')
        .addFields(
            { name: 'Permissions (1/2)', value: lines.slice(0, half).join('\n'), inline: true },
            { name: 'Permissions (2/2)', value: lines.slice(half).join('\n'), inline: true }
        )
        .setFooter({ text: 'Sélectionnez une permission pour la modifier · ✅ Autorisé · ❌ Refusé · ⬜ Hérité' });
}

module.exports = {
    name: 'perms',
    description: 'Gestion des permissions des rôles et des salons avec menus interactifs.',
    async execute(client, message, args) {
        if (!isAuthorized(message.member)) {
            return message.reply('❌ Permission **Gérer le serveur** requise.');
        }

        const sub = args[0]?.toLowerCase();
        const prefix = guildConfig.get(message.guild.id, 'prefix') || '+';

        // ══════════════════════════════════════════
        // +perms role @Role — éditeur de permissions
        // ══════════════════════════════════════════
        if (sub === 'role') {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
            if (!role) return message.reply(`❌ Mentionnez un rôle. Ex : \`${prefix}perms role @Role\``);
            if (role.managed) return message.reply('❌ Ce rôle est géré par une intégration et ne peut pas être modifié.');

            let page = 0;
            const totalPages = Math.ceil(PERM_LIST.length / 12);

            const backBtn = new ButtonBuilder().setCustomId('prole_back').setLabel('◀').setStyle(ButtonStyle.Secondary).setDisabled(page === 0);
            const nextBtn = new ButtonBuilder().setCustomId('prole_next').setLabel('▶').setStyle(ButtonStyle.Secondary).setDisabled(page + 1 >= totalPages);
            const closeBtn = new ButtonBuilder().setCustomId('prole_close').setLabel('✖ Fermer').setStyle(ButtonStyle.Danger);
            const navRow = () => new ActionRowBuilder().addComponents(backBtn, nextBtn, closeBtn);

            function selectRow() {
                const slice = PERM_LIST.slice(page * 12, (page + 1) * 12);
                return new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('prole_select')
                        .setPlaceholder('🎯 Choisir une permission à modifier...')
                        .addOptions(slice.map(p => ({
                            label: p.label,
                            value: p.key,
                            description: role.permissions.has(PermissionFlagsBits[p.key]) ? '✅ Activé' : '❌ Désactivé'
                        })))
                );
            }

            const panelMsg = await message.channel.send({
                embeds: [buildRoleEmbed(role, page)],
                components: [selectRow(), navRow()]
            });

            const collector = panelMsg.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 180000
            });

            let selectedPerm = null;

            collector.on('collect', async interaction => {
                if (interaction.isStringSelectMenu() && interaction.customId === 'prole_select') {
                    selectedPerm = interaction.values[0];
                    const permInfo = PERM_LIST.find(p => p.key === selectedPerm);
                    const hasIt = role.permissions.has(PermissionFlagsBits[selectedPerm]);

                    const actionEmbed = new EmbedBuilder()
                        .setTitle(`🎖️ Modifier : ${permInfo.label}`)
                        .setColor('#5865F2')
                        .setDescription(`Rôle : <@&${role.id}>\nÉtat actuel : ${hasIt ? '✅ **Activé**' : '❌ **Désactivé**'}`)
                        .setFooter({ text: 'Choisissez la nouvelle valeur' });

                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('prole_enable').setLabel('✅ Activer').setStyle(ButtonStyle.Success).setDisabled(hasIt),
                        new ButtonBuilder().setCustomId('prole_disable').setLabel('❌ Désactiver').setStyle(ButtonStyle.Danger).setDisabled(!hasIt),
                        new ButtonBuilder().setCustomId('prole_return').setLabel('◀ Retour').setStyle(ButtonStyle.Secondary)
                    );

                    return interaction.update({ embeds: [actionEmbed], components: [actionRow] });
                }

                if (interaction.isButton()) {
                    if (interaction.customId === 'prole_close') {
                        await interaction.update({ components: [] });
                        return collector.stop();
                    }
                    if (interaction.customId === 'prole_return') {
                        selectedPerm = null;
                        backBtn.setDisabled(page === 0);
                        nextBtn.setDisabled(page + 1 >= totalPages);
                        return interaction.update({ embeds: [buildRoleEmbed(role, page)], components: [selectRow(), navRow()] });
                    }
                    if (interaction.customId === 'prole_back' && page > 0) {
                        page--;
                        backBtn.setDisabled(page === 0);
                        nextBtn.setDisabled(page + 1 >= totalPages);
                        return interaction.update({ embeds: [buildRoleEmbed(role, page)], components: [selectRow(), navRow()] });
                    }
                    if (interaction.customId === 'prole_next' && page + 1 < totalPages) {
                        page++;
                        backBtn.setDisabled(page === 0);
                        nextBtn.setDisabled(page + 1 >= totalPages);
                        return interaction.update({ embeds: [buildRoleEmbed(role, page)], components: [selectRow(), navRow()] });
                    }
                    if (interaction.customId === 'prole_enable' || interaction.customId === 'prole_disable') {
                        await interaction.deferReply({ ephemeral: true });
                        const flag = PermissionFlagsBits[selectedPerm];
                        const enable = interaction.customId === 'prole_enable';
                        try {
                            const newPerms = enable
                                ? role.permissions.add(flag)
                                : role.permissions.remove(flag);
                            await role.edit({ permissions: newPerms });
                            await interaction.editReply(`✅ Permission **${PERM_LIST.find(p => p.key === selectedPerm)?.label}** ${enable ? 'activée' : 'désactivée'} pour <@&${role.id}>.`);
                        } catch (err) {
                            await interaction.editReply(`❌ Erreur : ${err.message}`);
                        }
                        selectedPerm = null;
                        backBtn.setDisabled(page === 0);
                        nextBtn.setDisabled(page + 1 >= totalPages);
                        // Reload role
                        const updatedRole = message.guild.roles.cache.get(role.id);
                        return panelMsg.edit({ embeds: [buildRoleEmbed(updatedRole || role, page)], components: [selectRow(), navRow()] });
                    }
                }
            });

            collector.on('end', () => { panelMsg.edit({ components: [] }).catch(() => {}); });
            return;
        }

        // ══════════════════════════════════════════
        // +perms channel #channel @RoleOrUser
        // ══════════════════════════════════════════
        if (sub === 'channel') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply(`❌ Mentionnez un salon. Ex : \`${prefix}perms channel #salon @Role\``);

            const targetMention = message.mentions.roles.first() || message.mentions.members.first();
            const rawTarget = args[2];
            let target = targetMention || (rawTarget ? message.guild.roles.cache.get(rawTarget) || message.guild.members.cache.get(rawTarget) : null);
            if (!target) target = message.guild.roles.cache.get(message.guild.id); // @everyone fallback

            const targetId = target.id;
            let overwrite = channel.permissionOverwrites.cache.get(targetId);

            const selectRow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('pch_select')
                    .setPlaceholder('🎯 Choisir une permission...')
                    .addOptions(PERM_LIST.slice(0, 25).map(p => {
                        const flag = PermissionFlagsBits[p.key];
                        const state = !flag ? '⬜' : overwrite?.allow.has(flag) ? '✅' : overwrite?.deny.has(flag) ? '❌' : '⬜';
                        return { label: p.label, description: state === '✅' ? 'Autorisé' : state === '❌' ? 'Refusé' : 'Hérité', value: p.key };
                    }))
            );

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('pch_close').setLabel('✖ Fermer').setStyle(ButtonStyle.Secondary)
            );

            const panelMsg = await message.channel.send({
                embeds: [buildChannelOverrideEmbed(channel, target, overwrite)],
                components: [selectRow, closeRow]
            });

            const collector = panelMsg.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 180000
            });

            let selectedPerm = null;

            collector.on('collect', async interaction => {
                if (interaction.isStringSelectMenu() && interaction.customId === 'pch_select') {
                    selectedPerm = interaction.values[0];
                    const permInfo = PERM_LIST.find(p => p.key === selectedPerm);
                    const flag = PermissionFlagsBits[selectedPerm];
                    const currentState = !flag ? 'hérité' : overwrite?.allow.has(flag) ? 'autorisé' : overwrite?.deny.has(flag) ? 'refusé' : 'hérité';

                    const actionEmbed = new EmbedBuilder()
                        .setTitle(`🔒 Modifier : ${permInfo.label}`)
                        .setColor('#5865F2')
                        .setDescription(`Salon : ${channel}\nPour : <${target.hexColor ? '@&' : '@'}${targetId}>\nÉtat actuel : **${currentState}**`)
                        .setFooter({ text: 'Choisissez la nouvelle valeur' });

                    const actionRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('pch_allow').setLabel('✅ Autoriser').setStyle(ButtonStyle.Success),
                        new ButtonBuilder().setCustomId('pch_deny').setLabel('❌ Refuser').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('pch_neutral').setLabel('⬜ Hériter').setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder().setCustomId('pch_return').setLabel('◀ Retour').setStyle(ButtonStyle.Secondary)
                    );

                    return interaction.update({ embeds: [actionEmbed], components: [actionRow] });
                }

                if (interaction.isButton()) {
                    if (interaction.customId === 'pch_close') {
                        await interaction.update({ components: [] });
                        return collector.stop();
                    }
                    if (interaction.customId === 'pch_return') {
                        selectedPerm = null;
                        overwrite = channel.permissionOverwrites.cache.get(targetId);
                        return interaction.update({
                            embeds: [buildChannelOverrideEmbed(channel, target, overwrite)],
                            components: [selectRow, closeRow]
                        });
                    }
                    if (['pch_allow', 'pch_deny', 'pch_neutral'].includes(interaction.customId)) {
                        await interaction.deferReply({ ephemeral: true });
                        const flag = PermissionFlagsBits[selectedPerm];
                        const permInfo = PERM_LIST.find(p => p.key === selectedPerm);
                        const newValue = interaction.customId === 'pch_allow' ? true :
                                         interaction.customId === 'pch_deny' ? false : null;
                        try {
                            await channel.permissionOverwrites.edit(targetId, { [selectedPerm]: newValue });
                            const actionLabel = newValue === true ? 'autorisé' : newValue === false ? 'refusé' : 'réinitialisé (hérité)';
                            await interaction.editReply(`✅ Permission **${permInfo.label}** ${actionLabel} pour ce salon.`);
                        } catch (err) {
                            await interaction.editReply(`❌ Erreur : ${err.message}`);
                        }
                        selectedPerm = null;
                        overwrite = channel.permissionOverwrites.cache.get(targetId);
                        return panelMsg.edit({
                            embeds: [buildChannelOverrideEmbed(channel, target, overwrite)],
                            components: [selectRow, closeRow]
                        });
                    }
                }
            });

            collector.on('end', () => { panelMsg.edit({ components: [] }).catch(() => {}); });
            return;
        }

        // ══════════════════════════════════════════
        // +perms reset #channel
        // ══════════════════════════════════════════
        if (sub === 'reset') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply(`❌ Mentionnez un salon. Ex : \`${prefix}perms reset #salon\``);
            try {
                await channel.permissionOverwrites.set([]);
                return message.reply(`✅ Toutes les permissions de ${channel} ont été réinitialisées.`);
            } catch (err) {
                return message.reply(`❌ Erreur : ${err.message}`);
            }
        }

        // ══════════════════════════════════════════
        // +perms sync #channel
        // ══════════════════════════════════════════
        if (sub === 'sync') {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            if (!channel) return message.reply(`❌ Mentionnez un salon.`);
            if (!channel.parent) return message.reply('❌ Ce salon n\'a pas de catégorie parente.');
            try {
                await channel.lockPermissions();
                return message.reply(`✅ ${channel} synchronisé avec la catégorie **${channel.parent.name}**.`);
            } catch (err) {
                return message.reply(`❌ Erreur : ${err.message}`);
            }
        }

        // ── Aide ──
        return message.reply(
            `**🔒 Gestion des Permissions :**\n` +
            `\`${prefix}perms role @Role\` — Modifier les permissions d'un rôle (interactif)\n` +
            `\`${prefix}perms channel #salon @Role\` — Modifier les overrides d'un salon (interactif)\n` +
            `\`${prefix}perms reset #salon\` — Réinitialiser toutes les permissions d'un salon\n` +
            `\`${prefix}perms sync #salon\` — Synchroniser un salon avec sa catégorie`
        );
    }
};
