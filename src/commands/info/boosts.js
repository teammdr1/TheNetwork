module.exports = {
    name: "boosts",
    description: "Afficher le nombre de boosts du serveur",
    async execute(client, message, args) {
        const boosts = message.guild.premiumSubscriptionCount;
        await message.channel.send(`Ce serveur a actuellement **${boosts}** boost(s).`);
    }
};
