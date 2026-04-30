module.exports = {
  name: "stop",
  run: async (client, message) => {

    const queue = client.player.nodes.get(message.guild.id);
    if (!queue)
      return message.reply("Rien à stopper.");

    queue.delete();
    message.reply("⏹️ Stop.");
  }
};
