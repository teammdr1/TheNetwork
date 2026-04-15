const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'timeout',
    description: 'Met un membre en timeout (mute temporaire)',

    async execute(client, message, args) {
        if (!message.guild) return;

        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("❌ Tu n'as pas la permission de mettre des membres en timeout.");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("❌ Mentionne un membre.");

        if (!member.moderatable) {
            return message.reply("❌ Je ne peux pas mettre ce membre en timeout (rôle trop haut ?).");
        }

        const duration = args[1]; // en minutes
        if (!duration || isNaN(duration)) {
            return message.reply("❌ Indique une durée en minutes. Exemple : `+timeout @User 10`");
        }

        const reason = args.slice(2).join(" ") || "Aucune raison fournie";
        const durationMs = parseInt(duration) * 60 * 1000;

        try {
            await member.timeout(durationMs, reason);
            message.channel.send(`✅ ${member.user.tag} est en timeout pendant ${duration} minute(s).`);
        } catch (err) {
            message.reply("❌ Impossible de mettre ce membre en timeout.");
        }
    }
};