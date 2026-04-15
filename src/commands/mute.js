module.exports = {
  name: 'mute',
  description: 'Mute un membre du serveur',
  async execute(client, message, args) {

    if (!message.member.permissions.has('MUTE_MEMBERS')) {
      return message.channel.send("Vous n'avez pas la permission de mute des membres.");
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.channel.send("Veuillez mentionner un membre à mute.");
    }

    if (!member.manageable) {
      return message.channel.send("Je ne peux pas mute ce membre.");
    }

    // durée
    const durationArg = args[1];
    if (!durationArg) {
      return message.channel.send("Veuillez indiquer une durée (ex: 10m, 1h, 30s).");
    }

    const time = parseTime(durationArg);
    if (!time) {
      return message.channel.send("Durée invalide. Exemple : 10m, 1h, 30s.");
    }

    const reason = args.slice(2).join(' ') || 'Aucune raison fournie';

    try {
      await member.timeout(time, reason);
      message.channel.send(`${member.user.tag} a été muté pendant ${durationArg}. Raison : ${reason}`);
    } catch (error) {
      console.error(error);
      message.channel.send("Une erreur est survenue lors du mute du membre.");
    }
  },
};

// fonction pour convertir le temps
function parseTime(time) {
  const unit = time.slice(-1);
  const number = parseInt(time.slice(0, -1));

  if (unit === 's') return number * 1000;
  if (unit === 'm') return number * 60 * 1000;
  if (unit === 'h') return number * 60 * 60 * 1000;
  if (unit === 'd') return number * 24 * 60 * 60 * 1000;

  return null;
}