const guildConfig = require('../utils/guildConfig');

module.exports = {
  name: 'messageCreate',
  once: false,
  execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const prefix = guildConfig.get(message.guild.id, 'prefix') || client.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      command.execute(client, message, args);
    } catch (err) {
      console.error(err);
      message.reply('❌ Erreur pendant l\'exécution de la commande.');
    }
  }
};
