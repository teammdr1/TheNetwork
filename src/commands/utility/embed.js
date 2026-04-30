// src/commands/embed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Map pour suivre les commandes embed actives par utilisateur (tu peux l'externaliser dans un autre fichier si tu veux)
const activeEmbeds = new Map();

module.exports = {
  name: 'embed',
  description: 'Créer un embed personnalisé via interaction avec boutons',
  async execute(client, message, args) {
    if (activeEmbeds.has(message.author.id)) {
      return message.channel.send("Vous avez déjà une commande en cours. Veuillez la terminer ou attendre qu'elle expire.");
    }

    const embed = new EmbedBuilder()
      .setTitle('Création d\'embed')
      .setDescription('Cliquez sur un des boutons ci-dessous pour commencer.')
      .setColor('#0099ff');

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('createEmbed')
          .setLabel('Créer un embed')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cancelEmbed')
          .setLabel('Annuler')
          .setStyle(ButtonStyle.Danger)
      );

    const embedMessage = await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    activeEmbeds.set(message.author.id, { message: embedMessage });

    const collector = embedMessage.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: "Vous ne pouvez pas utiliser cette interaction.", ephemeral: true });
      }

      if (interaction.customId === 'createEmbed') {
        await interaction.deferReply({ ephemeral: true });

        let embedData = {};

        const askQuestion = async (question) => {
          await interaction.followUp({ content: question, ephemeral: true });
          const filter = msg => msg.author.id === message.author.id;
          try {
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
            return collected.first().content;
          } catch {
            return null;
          }
        };

        try {
          embedData.title = await askQuestion('Quel titre voulez-vous pour votre embed ?');
          if (!embedData.title) throw new Error('Commande annulée ou temps écoulé.');

          embedData.description = await askQuestion('Quelle sera la description de l\'embed ?');
          embedData.color = await askQuestion('Quelle sera la couleur de l\'embed ? (hex code ex: #ff0000)');

          const addImage = await askQuestion('Voulez-vous ajouter une image ? (Oui / Non)');
          if (addImage?.toLowerCase() === 'oui') {
            embedData.image = await askQuestion('Veuillez entrer l\'URL de l\'image.');
          }

          const addThumbnail = await askQuestion('Voulez-vous ajouter un thumbnail (miniature) ? (Oui / Non)');
          if (addThumbnail?.toLowerCase() === 'oui') {
            embedData.thumbnail = await askQuestion('Veuillez entrer l\'URL du thumbnail.');
          }

          const addFooter = await askQuestion('Voulez-vous ajouter un footer ? (Oui / Non)');
          if (addFooter?.toLowerCase() === 'oui') {
            embedData.footer = await askQuestion('Veuillez entrer le texte du footer.');
            const addFooterImage = await askQuestion('Voulez-vous ajouter une image pour le footer ? (Oui / Non)');
            if (addFooterImage?.toLowerCase() === 'oui') {
              embedData.footerImage = await askQuestion('Veuillez entrer l\'URL de l\'image du footer.');
            }
          }

          const finalEmbed = new EmbedBuilder()
            .setTitle(embedData.title)
            .setDescription(embedData.description)
            .setColor(embedData.color || '#0099ff');

          if (embedData.image) finalEmbed.setImage(embedData.image);
          if (embedData.thumbnail) finalEmbed.setThumbnail(embedData.thumbnail);
          if (embedData.footer) {
            finalEmbed.setFooter({
              text: embedData.footer,
              iconURL: embedData.footerImage || null
            });
          }

          await message.channel.send({ embeds: [finalEmbed] });
          await interaction.editReply({ content: 'Embed créé avec succès !', ephemeral: true });

        } catch (error) {
          await interaction.followUp({ content: 'Commande annulée ou temps écoulé.', ephemeral: true });
        } finally {
          activeEmbeds.delete(message.author.id);
        }

      } else if (interaction.customId === 'cancelEmbed') {
        await interaction.update({ content: 'Commande annulée.', components: [] });
        embedMessage.delete().catch(() => {});
        collector.stop();
        activeEmbeds.delete(message.author.id);
      }
    });

    collector.on('end', () => {
      if (activeEmbeds.has(message.author.id)) {
        embedMessage.edit({ content: 'Commande expirée.', components: [] }).catch(() => {});
        activeEmbeds.delete(message.author.id);
      }
    });
  },
};
