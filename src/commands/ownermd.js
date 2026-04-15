// src/commands/ownermd.js
module.exports = {
  name: 'ownermd',
  description: 'Affiche le préfixe utilisé par le bot sur le serveur',
  execute(client, message, args) {
    // Ici je prends le préfix de config si tu veux, sinon fixe '+'
    const prefix = client.prefix || '+';
    message.channel.send(`Mon préfix sur ce serveur est : ${prefix}`);
  },
};
