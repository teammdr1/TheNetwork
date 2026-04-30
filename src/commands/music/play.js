module.exports = {
  name: "play",
  run: async (client, message, args) => {

    const channel = message.member.voice.channel;
    if (!channel) return message.reply("Va dans un vocal.");

    const query = args.join(" ");
    if (!query) return message.reply("Mets une musique.");

    await client.player.play(channel, query, {
      nodeOptions: {
        metadata: {
          channel: message.channel
        },
        volume: 50,
        leaveOnEmpty: true,
        leaveOnEnd: true
      }
    });

    message.reply("🔍 Recherche...");
  }
};
