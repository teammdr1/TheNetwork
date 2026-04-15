const guildConfig = require('../utils/guildConfig');

module.exports = {
    name: 'setbackup',
    description: 'Définit le lien du serveur de backup',
    async execute(client, message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande.');
        }
        const link = args[0];
        if (!link) {
            return message.reply('❌ Fournissez un lien. Ex : `+setbackup https://discord.gg/monserveur`');
        }
        guildConfig.set(message.guild.id, 'backupLink', link);
        message.reply(`✅ Lien de backup défini : ${link}`);
    },
};
