module.exports = {
  name: "skip",
  run: async (client, message) => {

    const queue = client.player.nodes.get(message.guild.id);
    if (!queue || !queue.currentTrack)
      return message.reply("Aucune musique.");

    queue.node.skip();
    message.reply("⏭️ Skip.");
  }
};
