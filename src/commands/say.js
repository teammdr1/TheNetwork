module.exports = {
    name: "say",
    description: "Faire parler le bot",
    async execute(client, message, args) {
        if (args.length === 0) {
            return message.channel.send("❌ Veuillez fournir un message à faire dire au bot.");
        }
        const text = args.join(" ");
        await message.channel.send(text);
    }
};