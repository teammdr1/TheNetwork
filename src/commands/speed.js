// src/commands/speed.js
module.exports = {
  name: 'speed',
  description: 'Affiche la latence du bot et de l\'API Discord',
  execute(client, message, args) {
    const latency = Math.max(Date.now() - message.createdTimestamp, 0);
    const apiLatency = Math.round(client.ws.ping);

    message.reply(`🏓 **Latence du bot :** ${latency}ms\n📡 **Latence API Discord :** ${apiLatency}ms`);
  },
};
