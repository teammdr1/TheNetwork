module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  async execute(oldState, newState, client) {
    if (!newState.guild) return;
    if (newState.member?.user?.bot) return;
    if (oldState.channelId === newState.channelId) return;

    const queue = client.player.nodes.get(newState.guild.id);
    if (!queue) return;

    const requesterId = queue.metadata?.requesterId;
    if (!requesterId || requesterId !== newState.id) return;

    if (!newState.channel) return;
    if (queue.channel?.id === newState.channel.id) return;

    try {
      await queue.connect(newState.channel);
      console.log(`Le bot a rejoint ${newState.channel.name} suite au déplacement de ${newState.member.user.tag}`);
    } catch (error) {
      console.error('Erreur lors du déplacement du bot vocal :', error);
    }
  }
};
