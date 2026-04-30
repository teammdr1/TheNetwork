const { EmbedBuilder } = require('discord.js');

// Store global au fichier
const deletedMessages = new Map();

module.exports = {
    name: 'snipe',
    description: 'Affiche les messages supprimés récemment',

    init(client) {
        // On évite de register plusieurs fois l'event
        if (client._snipeInitialized) return;
        client._snipeInitialized = true;

        client.on('messageDelete', (message) => {
            if (!message.guild) return;
            if (message.partial) return;

            if (!deletedMessages.has(message.channel.id)) {
                deletedMessages.set(message.channel.id, []);
            }

            const snipes = deletedMessages.get(message.channel.id);

            snipes.unshift({
                content: message.content || null,
                author: message.author.tag,
                createdAt: message.createdTimestamp
            });

            // Limite à 10 messages
            if (snipes.length > 10) snipes.pop();
        });
    },

    async execute(client, message, args) {

        // Initialise l’event si pas déjà fait
        this.init(client);

        const snipes = deletedMessages.get(message.channel.id);

        if (!snipes || snipes.length === 0) {
            return message.reply("Aucun message supprimé récemment dans ce salon.");
        }

        const index = parseInt(args[0]) - 1 || 0;

        if (index < 0 || index >= snipes.length) {
            return message.reply(`Il y a seulement ${snipes.length} message(s) supprimé(s).`);
        }

        const msg = snipes[index];

        const embed = new EmbedBuilder()
            .setAuthor({ name: msg.author })
            .setDescription(msg.content || "*Message vide*")
            .setColor("Red")
            .setFooter({ text: `Message ${index + 1}/${snipes.length}` })
            .setTimestamp(msg.createdAt);

        message.channel.send({ embeds: [embed] });
    }
};
