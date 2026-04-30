module.exports = {
  name: "resume",
  run: async (client, message) => {

    const queue = client.player.nodes.get(message.guild.id);
    if (!queue)
      return message.reply("Rien à reprendre.");

    queue.node.setPaused(false);
    message.reply("▶️ Resume.");
  }
};
