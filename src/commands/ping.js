module.exports = {
  name: 'ping',
  description: 'Répond Pong !',
  execute(client, message, args) {
    message.reply('🏓 Pong !');
  }
};
