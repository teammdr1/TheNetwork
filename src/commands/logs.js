const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionsBitField
} = require('discord.js');
const guildConfig = require('../utils/guildConfig');
const { LOG_TYPES } = require('../utils/logHelper');

function isAuthorized(member) {
    return member.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
           guildConfig.getAll(member.guild.id).botOwners?.includes(member.id);
}

function buildConfigEmbed(guild) {
    const cfg = guildConfig.getAll(guild.id);
    const channels = cfg.logChannels || {};

    return new EmbedBuilder()
        .setTitle('📋 Configuration des Logs')
        .setColor('#5865F2')
        .setDescription('Définissez un salon de logs pour chaque type d\'événement.\nUtilisez le menu déroulant pour configurer chaque type.')
        .addFields(
            Object.entries(LOG_TYPES).map(([key, info]) => ({
                name: `${info.label}`,
                value: channels[key] ? `<#${channels[key]}>` : '❌ Non configuré',
                inline: true
            }))
        )
        .setFooter({ text: 'Sélectionnez un type de log pour le configurer.' })
        .setTimestamp();
}

function buildSelectMenu() {
    return new StringSelectMenuBuilder()
        .setCustomId('logs_type_select')
        .setPlaceholder('📋 Choisir un type de log à configurer...')
        .addOptions(
            Object.entries(LOG_TYPES).map(([key, info]) => ({
                label: info.label,
                description: info.desc,
                value: key
            }))
        );
}

module.exports = {
    name: 'logs',
    description: 'Configure les salons de logs par type d\'événement.',
    async execute(client, message, args) {
        if (!isAuthorized(message.member)) {
            return message.reply('❌ Permission **Gérer le serveur** requise.');
        }

        const sub = args[0]?.toLowerCase();
        const guildId = message.guild.id;

        // ── +logs set <type> #salon ──
        if (sub === 'set') {
            const type = args[1]?.toLowerCase();
            if (!LOG_TYPES[type]) {
                return message.reply(`❌ Type de log invalide. Types disponibles : \`${Object.keys(LOG_TYPES).join('`, `')}\``);
            }
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
            if (!channel) return message.reply('❌ Mentionnez un salon valide.');
            const cfg = guildConfig.getAll(guildId);
            const channels = cfg.logChannels || {};
            channels[type] = channel.id;
            guildConfig.setNested(guildId, 'logChannels', type, channel.id);
            return message.reply(`✅ Logs **${LOG_TYPES[type].label}** définis sur ${channel}.`);
        }

        // ── +logs clear <type> ──
        if (sub === 'clear') {
            const type = args[1]?.toLowerCase();
            if (!LOG_TYPES[type]) {
                return message.reply(`❌ Type invalide. Types : \`${Object.keys(LOG_TYPES).join('`, `')}\``);
            }
            guildConfig.setNested(guildId, 'logChannels', type, null);
            return message.reply(`✅ Logs **${LOG_TYPES[type].label}** désactivés.`);
        }

        // ── +logs clearall ──
        if (sub === 'clearall') {
            const empty = Object.fromEntries(Object.keys(LOG_TYPES).map(k => [k, null]));
            guildConfig.set(guildId, 'logChannels', empty);
            return message.reply('✅ Tous les salons de logs ont été supprimés.');
        }

        // ── Panel interactif ──
        const embed = buildConfigEmbed(message.guild);
        const selectRow = new ActionRowBuilder().addComponents(buildSelectMenu());
        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('logs_clearall').setLabel('🗑️ Tout effacer').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('logs_close').setLabel('✖ Fermer').setStyle(ButtonStyle.Secondary)
        );

        const panelMsg = await message.channel.send({ embeds: [embed], components: [selectRow, btnRow] });

        const collector = panelMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 180000
        });

        let selectedType = null;

        collector.on('collect', async interaction => {

            // ── Select: choisir un type ──
            if (interaction.isStringSelectMenu() && interaction.customId === 'logs_type_select') {
                selectedType = interaction.values[0];
                const info = LOG_TYPES[selectedType];
                const cfg = guildConfig.getAll(guildId);
                const current = cfg.logChannels?.[selectedType];

                const typeEmbed = new EmbedBuilder()
                    .setTitle(`${info.label} — Configuration`)
                    .setColor('#5865F2')
                    .setDescription(`**${info.desc}**\n\nSalon actuel : ${current ? `<#${current}>` : '❌ Non configuré'}`)
                    .setFooter({ text: 'Définissez ou supprimez le salon de logs.' });

                const actionRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('logs_set_channel').setLabel('🎯 Définir le salon').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('logs_clear_type').setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger).setDisabled(!current),
                    new ButtonBuilder().setCustomId('logs_back').setLabel('◀ Retour').setStyle(ButtonStyle.Secondary)
                );

                return interaction.update({ embeds: [typeEmbed], components: [selectRow, actionRow] });
            }

            // ── Bouton : définir le salon ──
            if (interaction.isButton() && interaction.customId === 'logs_set_channel') {
                const modal = new ModalBuilder()
                    .setCustomId('logs_modal_channel')
                    .setTitle(`📋 Logs — ${LOG_TYPES[selectedType]?.label}`)
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('channel')
                                .setLabel('ID ou #mention du salon')
                                .setStyle(TextInputStyle.Short)
                                .setPlaceholder('#logs-membres ou 1234567890')
                                .setRequired(true)
                        )
                    );
                return interaction.showModal(modal);
            }

            // ── Bouton : supprimer type ──
            if (interaction.isButton() && interaction.customId === 'logs_clear_type') {
                guildConfig.setNested(guildId, 'logChannels', selectedType, null);
                await interaction.reply({ content: `✅ Logs **${LOG_TYPES[selectedType].label}** désactivés.`, ephemeral: true });
                return interaction.message.edit({ embeds: [buildConfigEmbed(message.guild)], components: [selectRow, btnRow] });
            }

            // ── Bouton : retour ──
            if (interaction.isButton() && interaction.customId === 'logs_back') {
                selectedType = null;
                return interaction.update({ embeds: [buildConfigEmbed(message.guild)], components: [selectRow, btnRow] });
            }

            // ── Bouton : tout effacer ──
            if (interaction.isButton() && interaction.customId === 'logs_clearall') {
                const empty = Object.fromEntries(Object.keys(LOG_TYPES).map(k => [k, null]));
                guildConfig.set(guildId, 'logChannels', empty);
                await interaction.reply({ content: '✅ Tous les logs ont été effacés.', ephemeral: true });
                return interaction.message.edit({ embeds: [buildConfigEmbed(message.guild)], components: [selectRow, btnRow] });
            }

            // ── Bouton : fermer ──
            if (interaction.isButton() && interaction.customId === 'logs_close') {
                await interaction.update({ components: [] });
                collector.stop();
            }
        });

        // Écouter les modals via awaitModalSubmit
        collector.on('collect', async interaction => {
            if (!interaction.isModalSubmit() || interaction.customId !== 'logs_modal_channel') return;
            const raw = interaction.fields.getTextInputValue('channel').trim();
            const match = raw.match(/^<#(\d+)>$/) || raw.match(/^(\d+)$/);
            const chId = match ? match[1] : null;
            const channel = chId ? message.guild.channels.cache.get(chId) : null;

            if (!channel) {
                return interaction.reply({ content: '❌ Salon introuvable.', ephemeral: true });
            }

            guildConfig.setNested(guildId, 'logChannels', selectedType, channel.id);
            await interaction.reply({ content: `✅ Logs **${LOG_TYPES[selectedType].label}** définis sur ${channel}.`, ephemeral: true });
            await panelMsg.edit({ embeds: [buildConfigEmbed(message.guild)], components: [selectRow, btnRow] });
        });

        collector.on('end', () => {
            panelMsg.edit({ components: [] }).catch(() => {});
        });
    }
};
