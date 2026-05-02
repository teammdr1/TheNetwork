const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../../../config.js');
const guildConfig = require('../../utils/guildConfig');

const categoryNames = {
  admin: '⚔️・Moderation',
  avatar: '🎨・Avatars',
  backup: '💾・Backups',
  config: '🛡️・Securite',
  economy: '💰・Economie',
  fun: '🎉・Fun',
  games: '🎮・Jeux',
  giveaway: '🎁・Giveaways',
  info: '🔍・Informations',
  music: '🎵・Musique',
  other: '🔧・Autres',
  owner: '👑・Owner',
  roblox: '🎮・Roblox',
  utility: '🛠️・Utilitaires'
};

module.exports = {
  name: 'help',
  description: 'Affiche le menu d\'aide complet avec toutes les catégories et commandes.',
  async execute(client, message, args) {
    const prefix = guildConfig.get(message.guild.id, 'prefix') || '+';

    // Build categories dynamically
    const categories = {};
    client.commands.forEach(cmd => {
      const cat = cmd.category || 'other';
      const catName = categoryNames[cat] || cat;
      if (!categories[catName]) categories[catName] = [];
      categories[catName].push({
        name: `${prefix}${cmd.name}`,
        description: cmd.description || 'Pas de description'
      });
    });

    const totalCommands = Object.values(categories).flat().length;

    // ─── Boutons de liens ───
    const linkRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('💬 Serveur Support')
        .setStyle(ButtonStyle.Link)
        .setURL(config.supportServerInvite)
    );

    // ─── Embed d'accueil ───
    const homeEmbed = new EmbedBuilder()
      .setColor("#4287f5")
      .setTitle("🏡 Menu d'aide")
      .setDescription(
        [
          "Bienvenue dans le centre d’aide du bot.",
          "",
          "📌 Sélectionne une catégorie via le menu ci-dessous pour voir les commandes.",
          "",
          "⚙️ Utilisation :",
          "• `<...>` = obligatoire",
          "• `[ ... ]` = optionnel",
        ].join("\n"),
      )
      .addFields({
        name: "📊 Statistiques",
        value:
          `• Prefix : \`${prefix}\`\n` +
          `• Commandes : \`${totalCommands}\`\n` +
          `• Serveurs : \`${client.guilds.cache.size}\``,
        inline: true,
      })
      .setFooter({
        text: `${client.user.username} • Help Menu`,
        iconURL: client.user.displayAvatarURL(),
      });

    // ─── Select menu ───
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('📂 Choisissez une catégorie...')
      .addOptions(Object.keys(categories).map((cat, i) => ({
        label: cat.replace(/[^\w\s・-]/gu, '').trim() || cat,
        description: `${categories[cat].length} commande(s)`,
        value: i.toString(),
        emoji: cat.match(/^\p{Emoji}/u)?.[0] || '📋'
      })));

    const rowMenu = new ActionRowBuilder().addComponents(selectMenu);

    // ─── Boutons de navigation ───
    const backButton = new ButtonBuilder().setCustomId('help_back').setLabel('◀ Précédent').setStyle(ButtonStyle.Secondary).setDisabled(true);
    const nextButton = new ButtonBuilder().setCustomId('help_next').setLabel('Suivant ▶').setStyle(ButtonStyle.Secondary).setDisabled(true);
    const closeButton = new ButtonBuilder().setCustomId('help_close').setLabel('✖ Fermer').setStyle(ButtonStyle.Danger);
    const homeButton = new ButtonBuilder().setCustomId('help_home').setLabel('🏡 Accueil').setStyle(ButtonStyle.Success);
    const navRow = new ActionRowBuilder().addComponents(homeButton, backButton, nextButton, closeButton);

    const helpMessage = await message.channel.send({ embeds: [homeEmbed], components: [rowMenu, navRow, linkRow] });

    let currentCategory = null;
    let currentPage = 0;
    const commandsPerPage = 10;

    function buildCategoryEmbed(catName, page) {
      const commands = categories[catName];
      const totalPages = Math.ceil(commands.length / commandsPerPage);
      const slice = commands.slice(page * commandsPerPage, (page + 1) * commandsPerPage);
      return new EmbedBuilder()
        .setColor('#ebff00')
        .setTitle(`${catName}`)
        .setDescription(slice.map(c => `> **\`${c.name}\`**\n> ${c.description}`).join('\n\n'))
        .setFooter({ text: `Page ${page + 1}/${totalPages} • ${commands.length} commande(s)`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();
    }

    function updateNav(commands, page) {
      const totalPages = Math.ceil(commands.length / commandsPerPage);
      backButton.setDisabled(page === 0);
      nextButton.setDisabled(page + 1 >= totalPages);
    }

    const collector = helpMessage.createMessageComponentCollector({ time: 180000 });

    collector.on('collect', async interaction => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: '❌ Ce menu ne vous appartient pas.', ephemeral: true });
      }
      if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

      if (interaction.isStringSelectMenu() && interaction.customId === 'help_select') {
        const index = parseInt(interaction.values[0]);
        currentCategory = Object.keys(categories)[index];
        currentPage = 0;
        const commands = categories[currentCategory];
        updateNav(commands, currentPage);
        return interaction.update({ embeds: [buildCategoryEmbed(currentCategory, currentPage)], components: [rowMenu, navRow, linkRow] });
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'help_close') {
          await interaction.update({ content: '✖ Menu fermé.', embeds: [], components: [] });
          return collector.stop();
        }

        if (interaction.customId === 'help_home') {
          currentCategory = null;
          currentPage = 0;
          backButton.setDisabled(true);
          nextButton.setDisabled(true);
          return interaction.update({ embeds: [homeEmbed], components: [rowMenu, navRow, linkRow] });
        }

        if (!currentCategory) {
          return interaction.reply({ content: '❌ Sélectionnez d\'abord une catégorie.', ephemeral: true });
        }

        const commands = categories[currentCategory];
        if (interaction.customId === 'help_back' && currentPage > 0) currentPage--;
        if (interaction.customId === 'help_next' && (currentPage + 1) * commandsPerPage < commands.length) currentPage++;
        updateNav(commands, currentPage);
        return interaction.update({ embeds: [buildCategoryEmbed(currentCategory, currentPage)], components: [rowMenu, navRow, linkRow] });
      }
    });

    collector.on('end', () => {
      helpMessage.edit({ components: [] }).catch(() => {});
    });
  }
};
