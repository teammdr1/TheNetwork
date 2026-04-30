module.exports = {
  name: "queue",
  run: async (client, message) => {

    const queue = client.player.nodes.get(message.guild.id);
    if (!queue || !queue.tracks.size)
      return message.reply("Queue vide.");

    const tracks = queue.tracks.toArray().slice(0, 10).map((t, i) => {
      return `${i + 1}. ${t.title}`;
    }).join("\n");

    message.reply(`📄 Queue :\n${tracks}`);
  }
};
