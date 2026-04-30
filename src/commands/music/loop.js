module.exports = {
  name: "loop",
  run: async (client, message) => {

    const queue = client.player.nodes.get(message.guild.id);
    if (!queue)
      return message.reply("Rien à loop.");

    const mode = queue.repeatMode === 0 ? 1 : 0;
    queue.setRepeatMode(mode);

    message.reply(mode ? "🔁 Loop activé." : "❌ Loop désactivé.");
  }
};
