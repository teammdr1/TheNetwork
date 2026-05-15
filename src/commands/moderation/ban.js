const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Bannir un membre du serveur',

    async execute(client, message, args) {

        if (!message.guild) return;

        // Permission utilisateur
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("❌ Tu n'as pas la permission de bannir.");
        }

        // Permission bot
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("❌ Je n'ai pas la permission de bannir.");
        }

        const target =
            message.mentions.members.first() ||
            await message.guild.members.fetch(args[0]).catch(() => null);

        if (!target) {
            return message.reply("❌ Utilisation : `+ban @membre [raison]`");
        }

        // Empêche l'auto-ban
        if (target.id === message.author.id) {
            return message.reply("❌ Tu ne peux pas te bannir toi-même.");
        }

        // Empêche de bannir le bot
        if (target.id === client.user.id) {
            return message.reply("❌ Je ne peux pas me bannir moi-même.");
        }

        // Vérifie hiérarchie des rôles utilisateur
        if (
            message.guild.ownerId !== message.author.id &&
            target.roles.highest.position >= message.member.roles.highest.position
        ) {
            return message.reply("❌ Ce membre a un rôle égal ou supérieur au tien.");
        }

        // Vérifie hiérarchie des rôles bot
        if (
            target.roles.highest.position >=
            message.guild.members.me.roles.highest.position
        ) {
            return message.reply("❌ Mon rôle est trop bas pour bannir ce membre.");
        }

        // Bannable
        if (!target.bannable) {
            return message.reply("❌ Je ne peux pas bannir ce membre.");
        }

        const reason =
            args.slice(1).join(' ') || `Banni par ${message.author.tag}`;

        try {
            await target.ban({ reason });

            message.channel.send(
                `✅ **${target.user.tag}** a été banni.\n📌 Raison : ${reason}`
            );

        } catch (error) {
            console.error(error);
            message.reply("❌ Impossible de bannir ce membre.");
        }
    }
};