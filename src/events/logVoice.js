const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');
const { sendLog } = require('../utils/logHelper');

const COLOR_MAP = {
    green:  0x57F287,
    red:    0xED4245,
    yellow: 0xFEE75C,
    dred:   0xF04747,
    dgreen: 0x43B581,
};

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const guild = newState.guild || oldState.guild;
        const member = newState.member || oldState.member;
        if (!guild || !member || member.user?.bot) return;

        const oldCh = oldState.channel;
        const newCh = newState.channel;

        let title, desc, colorKey;

        if (!oldCh && newCh) {
            title = '🔊 Connexion vocale'; desc = `${member} a rejoint **${newCh.name}**`; colorKey = 'green';
        } else if (oldCh && !newCh) {
            title = '🔇 Déconnexion vocale'; desc = `${member} a quitté **${oldCh.name}**`; colorKey = 'red';
        } else if (oldCh && newCh && oldCh.id !== newCh.id) {
            title = '↔️ Déplacement vocal'; desc = `${member} s'est déplacé de **${oldCh.name}** → **${newCh.name}**`; colorKey = 'yellow';
        } else if (!oldState.serverMute && newState.serverMute) {
            title = '🔇 Mute vocal'; desc = `${member} a été **muté** dans **${newCh?.name}**`; colorKey = 'dred';
        } else if (oldState.serverMute && !newState.serverMute) {
            title = '🎤 Démute vocal'; desc = `${member} a été **démuté** dans **${newCh?.name}**`; colorKey = 'dgreen';
        } else if (!oldState.serverDeaf && newState.serverDeaf) {
            title = '🔕 Sourd vocal'; desc = `${member} a été **rendu sourd** dans **${newCh?.name}**`; colorKey = 'dred';
        } else if (oldState.serverDeaf && !newState.serverDeaf) {
            title = '🔔 Sourd levé'; desc = `${member} n'est **plus sourd** dans **${newCh?.name}**`; colorKey = 'dgreen';
        } else return;

        const container = new ContainerBuilder().setAccentColor(COLOR_MAP[colorKey]);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## ${title}`)
        );
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));

        const section = new SectionBuilder();
        section.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `${desc}\n\n**👤 Membre :** ${member.user.tag} \`${member.id}\``
            )
        );
        section.setThumbnailAccessory(
            new ThumbnailBuilder().setURL(member.user.displayAvatarURL({ dynamic: true }))
        );
        container.addSectionComponents(section);
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`-# <t:${Math.floor(Date.now() / 1000)}:F>`)
        );

        await sendLog(guild, 'voice', container);
    }
};
