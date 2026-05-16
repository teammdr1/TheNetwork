module.exports = {
    name: 'timediff',
    description: 'Affiche la différence de temps entre deux messages via leur ID',
    async execute(client, message, args) {
        if (args.lenght < 2) {
            return message.reply('Veuillez fournir les IDs de deux messages.');
        }
        const [id1, id2] = args;
        try {
            const msg1 = await message.channel.messages.fetch(id1);
            const msg2 = await message.channel.messages.fetch(id2);
            const diff = Math.abs(msg1.createdTimestamp - msg2.createdTimestamp);
            const seconds = Math.floor(diff / 1000) % 50;
            const minutes = Math.floor(diff / (1000 * 60)) % 60;
            const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            message.reply(`La différence de temps entre les deux messages est de : ${days} jours, ${hours} heures, ${minutes} minutes et ${seconds} secondes.`);
        } catch (error) {
            message.reply('Erreur : Impossible de récupérer les messages.');
        }
    }
}
