const {
    PermissionsBitField,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'owner',
    description: 'Gère les propriétaires du bot sur ce serveur (accès total aux commandes).',
    async execute(client, message, args) {
        const guildId = message.guild.id;
        const cfg = guildConfig.getAll(guildId);
        const botOwners = cfg.botOwners || [];
        const prefix = cfg.prefix || '+';

        const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);
        const isBotOwner = botOwners.includes(message.author.id);

        if (!isAdmin && !isBotOwner) {
            return message.reply('❌ Réservé aux administrateurs ou aux owners du bot.');
        }

        const sub = args[0]?.toLowerCase();

        if (!sub || sub === 'list') {
            if (botOwners.length === 0) {
                return message.reply(`ℹ️ Aucun owner configuré.\nUtilisez \`${prefix}owner add @user\` pour en ajouter.`);
            }
            const ownerList = botOwners.map((id, i) => {
                const member = message.guild.members.cache.get(id);
                return `**${i + 1}.** ${member ? member.toString() : `<@${id}>`} \`${id}\``;
            }).join('\n');

            const container = new ContainerBuilder().setAccentColor(0xF1C40F);
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 👑 Owners du Bot — ${message.guild.name}`)
            );
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(ownerList));
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    '**📋 Droits accordés**\nLes owners ont accès à **toutes les commandes** (setup, tickets, giveaways, modération, logs, etc.) sans permissions Discord spécifiques.'
                )
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`-# ${botOwners.length} owner(s)`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (sub === 'add') {
            const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!target) return message.reply('❌ Mentionnez un membre ou donnez son ID.');
            if (target.user.bot) return message.reply('❌ Un bot ne peut pas être owner.');
            if (botOwners.includes(target.id)) return message.reply(`❌ ${target} est déjà owner.`);

            botOwners.push(target.id);
            guildConfig.set(guildId, 'botOwners', botOwners);

            const container = new ContainerBuilder().setAccentColor(0x57F287);
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `## 👑 Owner Ajouté\n${target} est maintenant **owner du bot** sur ce serveur.\n\n✅ Toutes les commandes du bot sont débloquées pour ce membre.`
                        )
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(target.user.displayAvatarURL({ dynamic: true, size: 64 }))
                    )
            );
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`-# Par ${message.author.tag}`)
            );
            return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }

        if (sub === 'remove') {
            const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!target) return message.reply('❌ Mentionnez un membre ou donnez son ID.');
            if (!botOwners.includes(target.id)) return message.reply(`❌ ${target} n'est pas owner.`);
            if (target.id === message.author.id && !isAdmin)
                return message.reply('❌ Seul un admin peut vous retirer.');

            guildConfig.set(guildId, 'botOwners', botOwners.filter(id => id !== target.id));
            return message.reply(`✅ ${target} retiré des owners du bot.`);
        }

        if (sub === 'clear') {
            if (!isAdmin) return message.reply('❌ Seul un administrateur peut effacer tous les owners.');
            guildConfig.set(guildId, 'botOwners', []);
            return message.reply('✅ Tous les owners ont été supprimés.');
        }

        return message.reply(
            `**👑 Commandes Owner :**\n` +
            `\`${prefix}owner\` — Lister les owners\n` +
            `\`${prefix}owner add @user\` — Ajouter un owner\n` +
            `\`${prefix}owner remove @user\` — Retirer un owner\n` +
            `\`${prefix}owner clear\` — Tout effacer (admin uniquement)`
        );
    }
};
