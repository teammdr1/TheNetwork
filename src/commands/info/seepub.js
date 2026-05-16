const {
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
} = require('discord.js');

const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: 'seepub',
    description: 'Affiche la publicité/présentation du serveur',

    async execute(client, message, args) {
        const cfg = guildConfig.getAll(message.guild.id);
        const description = cfg.serverDescription;

        if (!description) {
            return message.reply(
                '❌ Aucune description configurée. Utilisez `+setdesc <texte>` pour en définir une.'
            );
        }

        const container = new ContainerBuilder()
            .setAccentColor(0x00FF15);

        container.addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(1)
                .setDivider(true)
        );

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(description)
        );

        message.channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    },
};
