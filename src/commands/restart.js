const Discord = require('discord.js');
module.exports = {
    name: 'restart',
    description: 'Redémarre le bot',
    async execute(client, message, args) {
        if (message.author.id !== client.config.ownerId) {
            return message.reply("Vous n'avez pas la permission d'utiliser cette commande.");
        }
        await message.reply("Redémarre en cours...");
        process.exit(0);
    }
}