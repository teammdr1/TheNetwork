const guildConfig = require('../utils/guildConfig');

module.exports = {
    name: 'backup',
    description: 'Envoie le lien du serveur de backup',
    execute(client, message, args) {
        const cfg = guildConfig.getAll(message.guild.id);
        if (!cfg.backupLink) {
            return message.reply('❌ Aucun lien de backup configuré. Utilisez `+setbackup <lien>` pour en définir un.');
        }
        message.channel.send(`🔗 Serveur de backup : ${cfg.backupLink}`);
    },
};
