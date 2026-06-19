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
    name: 'dm4ll',
    description: 'Envoie un message à tous les membres du serveur.',
    usage: '+dm4ll <message>',

    async execute(client, message, args) {
        if (message.author.id !== guildConfig.getAll(message.guild.id).botOwners[0]) {
            return message.reply("Tu n'as pas la permission d'utiliser cette commande.");
        }
        if (args.length < 2) {
            return message.reply("Usage : +dm4ll <message>");
        }
        if (args.length > 2) {
            return message.reply("Le message ne peut pas contenir plus de 2 mots.");
        }
        const messageContent = args.slice(1).join(" ");
        const members = message.guild.members.cache.filter(member => !member.user.bot);
        let successCount = 0;
        let failureCount = 0;

        for (const member of members.values ()) {
            try {
                await member.send(messageContent);
                successCount++;
            } catch (error) {
                failureCount++;
            }
        }

        const container = new ContainerBuilder().setAccentColor(0xFF000);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## 📨 DM4LL — ${message.guild.name}`)
        )
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Le message a été envoyé à ${successCount} membres avec succès.\nÉchec pour ${failureCount} membres.`)
        )
        return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });

    }
};
