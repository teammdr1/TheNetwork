const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType
} = require('discord.js');
const guildConfig = require('../utils/guildConfig');
const tickets = require('../utils/tickets');

// ===== UTILITAIRES =====

function slugify(text) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20);
}

function isStaff(member, cat) {
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
    return cat.staffRoles.some(roleId => member.roles.cache.has(roleId));
}

async function createTicketChannel(guild, member, category, ticketConfig) {
    // Incrémenter le compteur
    const newCount = (ticketConfig.ticketCount || 0) + 1;
    guildConfig.setNested(guild.id, 'ticketConfig', 'ticketCount', newCount);

    const channelName = `ticket-${String(newCount).padStart(4, '0')}-${slugify(member.user.username)}`;

    // Permissions du channel
    const permOverwrites = [
        {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
            id: member.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.AttachFiles
            ]
        },
        {
            id: guild.members.me.id,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.ManageMessages
            ]
        }
    ];

    // Ajouter les rôles staff
    for (const roleId of category.staffRoles) {
        const role = guild.roles.cache.get(roleId);
        if (role) {
            permOverwrites.push({
                id: roleId,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.ManageMessages,
                    PermissionsBitField.Flags.AttachFiles
                ]
            });
        }
    }

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.discordCategoryId || undefined,
        permissionOverwrites: permOverwrites,
        topic: `Ticket de ${member.user.tag} | Catégorie: ${category.name} | ID: ${member.id}`
    });

    return { channel, number: newCount };
}

async function sendTicketEmbed(channel, member, category, number) {
    const staffMentions = category.staffRoles.length > 0
        ? category.staffRoles.map(id => `<@&${id}>`).join(' ')
        : '';

    const embed = new EmbedBuilder()
        .setTitle(`🎫 Ticket #${String(number).padStart(4, '0')} — ${category.name}`)
        .setDescription(
            `Bonjour ${member} ! 👋\nMerci d'avoir ouvert un ticket **${category.emoji || '🎫'} ${category.name}**.\n\n` +
            `Décrivez votre demande en détail et un membre du staff vous répondra dès que possible.\n\n` +
            (staffMentions ? `Staff notifié : ${staffMentions}` : '')
        )
        .setColor('#5865F2')
        .addFields(
            { name: '👤 Créé par', value: `${member}`, inline: true },
            { name: '📂 Catégorie', value: `${category.emoji || '🎫'} ${category.name}`, inline: true },
            { name: '📅 Ouvert le', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setFooter({ text: `Ticket #${String(number).padStart(4, '0')}` })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_accept')
            .setLabel('✅ Accepter')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('ticket_refuse')
            .setLabel('❌ Refuser')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('🔒 Fermer')
            .setStyle(ButtonStyle.Secondary)
    );

    if (staffMentions) {
        await channel.send({ content: staffMentions, allowedMentions: { roles: category.staffRoles } });
    }
    await channel.send({ embeds: [embed], components: [row] });
}

async function logTicketAction(guild, cfg, action, member, category, channelName) {
    const logChannelId = cfg.ticketConfig?.logChannelId || cfg.logChannelId;
    if (!logChannelId) return;
    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    const colors = { open: '#5865F2', accept: '#57F287', refuse: '#ED4245', close: '#95A5A6' };
    const labels = { open: '🎫 Ticket ouvert', accept: '✅ Ticket accepté', refuse: '❌ Ticket refusé', close: '🔒 Ticket fermé' };

    const embed = new EmbedBuilder()
        .setTitle(labels[action] || action)
        .setColor(colors[action] || '#5865F2')
        .addFields(
            { name: '👤 Membre', value: `${member.user.tag} (${member.id})`, inline: true },
            { name: '📂 Catégorie', value: category?.name || 'Inconnue', inline: true },
            { name: '📋 Channel', value: channelName || 'N/A', inline: true }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] }).catch(() => {});
}

// ===== GESTIONNAIRE =====

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.guild) return;

        const { customId } = interaction;
        if (!customId) return;

        const cfg = guildConfig.getAll(interaction.guild.id);
        const tc = cfg.ticketConfig;

        // ─── BOUTON : Créer ticket (1 seule catégorie) ───
        if (customId.startsWith('ticket_create_')) {
            const catId = customId.replace('ticket_create_', '');
            const category = tc.categories.find(c => c.id === catId);
            if (!category) return interaction.reply({ content: '❌ Catégorie introuvable.', ephemeral: true });

            await interaction.deferReply({ ephemeral: true });

            // Vérifier si l'utilisateur a déjà un ticket ouvert dans cette catégorie
            const all = tickets.getAll();
            const existing = Object.values(all).find(t =>
                t.guildId === interaction.guild.id &&
                t.userId === interaction.user.id &&
                t.categoryId === category.id &&
                t.status === 'open'
            );
            if (existing) {
                const existCh = interaction.guild.channels.cache.get(existing.channelId);
                if (existCh) return interaction.editReply({ content: `❌ Tu as déjà un ticket ouvert : ${existCh}` });
            }

            try {
                const member = await interaction.guild.members.fetch(interaction.user.id);
                const { channel, number } = await createTicketChannel(interaction.guild, member, category, tc);
                tickets.create(channel.id, {
                    channelId: channel.id,
                    guildId: interaction.guild.id,
                    userId: member.id,
                    categoryId: category.id,
                    categoryName: category.name,
                    status: 'open',
                    number,
                    createdAt: Date.now()
                });
                await sendTicketEmbed(channel, member, category, number);
                await logTicketAction(interaction.guild, cfg, 'open', member, category, channel.name);
                await interaction.editReply({ content: `✅ Ton ticket a été créé : ${channel}` });
            } catch (err) {
                console.error('Erreur création ticket:', err);
                await interaction.editReply({ content: `❌ Erreur lors de la création du ticket : ${err.message}` });
            }
            return;
        }

        // ─── BOUTON : Ouvrir le select menu (plusieurs catégories) ───
        if (customId === 'ticket_open_select') {
            return interaction.reply({ content: '⬇️ Choisissez une catégorie dans le menu ci-dessous.', ephemeral: true });
        }

        // ─── SELECT MENU : Choisir une catégorie ───
        if (customId === 'ticket_select_category') {
            if (!interaction.isStringSelectMenu()) return;
            const catId = interaction.values[0];
            const category = tc.categories.find(c => c.id === catId);
            if (!category) return interaction.reply({ content: '❌ Catégorie introuvable.', ephemeral: true });

            await interaction.deferReply({ ephemeral: true });

            const all = tickets.getAll();
            const existing = Object.values(all).find(t =>
                t.guildId === interaction.guild.id &&
                t.userId === interaction.user.id &&
                t.categoryId === category.id &&
                t.status === 'open'
            );
            if (existing) {
                const existCh = interaction.guild.channels.cache.get(existing.channelId);
                if (existCh) return interaction.editReply({ content: `❌ Tu as déjà un ticket ouvert dans cette catégorie : ${existCh}` });
            }

            try {
                const member = await interaction.guild.members.fetch(interaction.user.id);
                const { channel, number } = await createTicketChannel(interaction.guild, member, category, tc);
                tickets.create(channel.id, {
                    channelId: channel.id,
                    guildId: interaction.guild.id,
                    userId: member.id,
                    categoryId: category.id,
                    categoryName: category.name,
                    status: 'open',
                    number,
                    createdAt: Date.now()
                });
                await sendTicketEmbed(channel, member, category, number);
                await logTicketAction(interaction.guild, cfg, 'open', member, category, channel.name);
                await interaction.editReply({ content: `✅ Ton ticket a été créé : ${channel}` });
            } catch (err) {
                console.error('Erreur création ticket:', err);
                await interaction.editReply({ content: `❌ Erreur lors de la création du ticket : ${err.message}` });
            }
            return;
        }

        // ─── BOUTON : Accepter ───
        if (customId === 'ticket_accept') {
            if (!interaction.isButton()) return;
            const ticket = tickets.get(interaction.channel.id);
            if (!ticket) return interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });

            const category = tc.categories.find(c => c.id === ticket.categoryId);
            const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
            if (!member || !isStaff(member, category || { staffRoles: [] })) {
                return interaction.reply({ content: '❌ Seul le staff peut accepter un ticket.', ephemeral: true });
            }
            if (ticket.status !== 'open') {
                return interaction.reply({ content: '❌ Ce ticket est déjà traité.', ephemeral: true });
            }

            tickets.update(interaction.channel.id, { status: 'accepted', acceptedBy: member.id });

            const embed = new EmbedBuilder()
                .setTitle('✅ Ticket accepté')
                .setDescription(`Ce ticket a été **accepté** par ${member}.\nNous allons traiter votre demande rapidement.`)
                .setColor('#57F287')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await logTicketAction(interaction.guild, cfg, 'accept', { user: interaction.user }, category, interaction.channel.name);
            return;
        }

        // ─── BOUTON : Refuser ───
        if (customId === 'ticket_refuse') {
            if (!interaction.isButton()) return;
            const ticket = tickets.get(interaction.channel.id);
            if (!ticket) return interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });

            const category = tc.categories.find(c => c.id === ticket.categoryId);
            const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
            if (!member || !isStaff(member, category || { staffRoles: [] })) {
                return interaction.reply({ content: '❌ Seul le staff peut refuser un ticket.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('❌ Ticket refusé')
                .setDescription(`Ce ticket a été **refusé** par ${member}.\nLe salon sera supprimé dans 5 secondes.`)
                .setColor('#ED4245')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await logTicketAction(interaction.guild, cfg, 'refuse', { user: interaction.user }, category, interaction.channel.name);
            tickets.update(interaction.channel.id, { status: 'refused' });

            setTimeout(() => {
                tickets.remove(interaction.channel.id);
                interaction.channel.delete('Ticket refusé').catch(() => {});
            }, 5000);
            return;
        }

        // ─── BOUTON : Fermer ───
        if (customId === 'ticket_close') {
            if (!interaction.isButton()) return;
            const ticket = tickets.get(interaction.channel.id);
            if (!ticket) return interaction.reply({ content: '❌ Ticket introuvable.', ephemeral: true });

            const category = tc.categories.find(c => c.id === ticket.categoryId);
            const isCreator = interaction.user.id === ticket.userId;
            const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
            const staff = member && isStaff(member, category || { staffRoles: [] });

            if (!isCreator && !staff) {
                return interaction.reply({ content: '❌ Seul le créateur du ticket ou le staff peut le fermer.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('🔒 Ticket fermé')
                .setDescription(`Ce ticket a été **fermé** par ${interaction.user}.\nLe salon sera supprimé dans 5 secondes.`)
                .setColor('#95A5A6')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            await logTicketAction(interaction.guild, cfg, 'close', { user: interaction.user }, category, interaction.channel.name);
            tickets.update(interaction.channel.id, { status: 'closed' });

            setTimeout(() => {
                tickets.remove(interaction.channel.id);
                interaction.channel.delete('Ticket fermé').catch(() => {});
            }, 5000);
            return;
        }
    }
};
