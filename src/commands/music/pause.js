module.exports = {
  name: "pause",
  run: async (client, message) => {

    const queue = client.player.nodes.get(message.guild.id);
    if (!queue)
      return message.reply("Rien à mettre en pause.");

    queue.node.setPaused(true);
    message.reply("⏸️ Pause.");
  }
};
