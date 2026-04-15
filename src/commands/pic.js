const { EmbedBuilder } = require('discord.js')
const { description } = require('./warn')

module.exports = {
    name: 'pic',
    description: 'Affiche la photo de profil d\'un membre mentionné',
    async execute(client, message, args) {
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply("Vous devez mentionner un utilisateur pour le patter.");
        }
        const embed = new EmbedBuilder()
        .setColor('#2f3136')
        .setDescription('Voici la photo de profil de ' + member.user.tag)
        .setImage(member.user.displayAvatarURL({ dynamic: true, size : 512}))
        message.channel.send({embeds : [embed]});
    }
}