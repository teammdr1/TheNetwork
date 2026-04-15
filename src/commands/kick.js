// src/commands/kick.js
module.exports = {
  name: 'kick',
  description: 'Expulse un membre du serveur',
    async execute(client, message, args) {
    // Vérifie si l'utilisateur a la permission d'expulser des membres
    if (!message.member.permissions.has('KICK_MEMBERS')) {
        return message.channel.send("Vous n'avez pas la permission d'expulser des membres.");
    }
    // Vérifie si un membre a été mentionné
    const member = message.mentions.members.first();
    if (!member) {
        return message.channel.send("Veuillez mentionner un membre à expulser.");
    }
    // Vérifie si le membre peut être expulsé
    if (!member.kickable) {
        return message.channel.send("Je ne peux pas expulser ce membre.");
    }
    // Récupère la raison de l'expulsion
    const reason = args.slice(1).join(' ') || 'Aucune raison fournie';
    // Expulse le membre
    try {
        await member.kick(reason);
        message.channel.send(`${member.user.tag} a été expulsé. Raison : ${reason}`);
    } catch (error) {
        console.error(error);
        message.channel.send("Une erreur est survenue lors de l'expulsion du membre.");
    }
  },
};