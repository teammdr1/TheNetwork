const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../utils/logHelper');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const guild = newState.guild || oldState.guild;
        const member = newState.member || oldState.member;
        if (!guild || !member || member.user?.bot) return;

        const oldCh = oldState.channel;
        const newCh = newState.channel;

        let title, desc, color;

        if (!oldCh && newCh) {
            title = '🔊 Connexion vocale'; desc = `${member} a rejoint **${newCh.name}**`; color = '#57F287';
        } else if (oldCh && !newCh) {
            title = '🔇 Déconnexion vocale'; desc = `${member} a quitté **${oldCh.name}**`; color = '#ED4245';
        } else if (oldCh && newCh && oldCh.id !== newCh.id) {
            title = '↔️ Déplacement vocal'; desc = `${member} s'est déplacé de **${oldCh.name}** → **${newCh.name}**`; color = '#FEE75C';
        } else if (!oldState.serverMute && newState.serverMute) {
            title = '🔇 Mute vocal'; desc = `${member} a été **muté** dans **${newCh?.name}**`; color = '#F04747';
        } else if (oldState.serverMute && !newState.serverMute) {
            title = '🎤 Démute vocal'; desc = `${member} a été **démuté** dans **${newCh?.name}**`; color = '#43B581';
        } else if (!oldState.serverDeaf && newState.serverDeaf) {
            title = '🔕 Sourd vocal'; desc = `${member} a été **rendu sourd** dans **${newCh?.name}**`; color = '#F04747';
        } else if (oldState.serverDeaf && !newState.serverDeaf) {
            title = '🔔 Sourd levé'; desc = `${member} n'est **plus sourd** dans **${newCh?.name}**`; color = '#43B581';
        } else return;

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(color)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .addFields({ name: '👤 Membre', value: `${member.user.tag} \`${member.id}\``, inline: true })
            .setTimestamp();

        await sendLog(guild, 'voice', embed);
    }
};
