const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const REVIEW_CHANNEL_ID = "1495351088126361611";
const DATA_PATH = path.join(__dirname, '../../data/reviews.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Envoyer un avis')
    .addIntegerOption(option =>
      option.setName('note')
        .setDescription('Note entre 1 et 5')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('commentaire')
        .setDescription('Ton avis')
        .setRequired(true)
    ),

  async execute(interaction) {

    const note = interaction.options.getInteger('note');
    const content = interaction.options.getString('commentaire');

    if (!note || note < 1 || note > 5) {
      return interaction.reply({ content: "Note entre 1 et 5.", ephemeral: true });
    }

    if (!content) {
      return interaction.reply({ content: "Ajoute un commentaire.", ephemeral: true });
    }

    let data = {};
    if (fs.existsSync(DATA_PATH)) {
      data = JSON.parse(fs.readFileSync(DATA_PATH));
    }

    const userId = interaction.user.id;

    if (data[userId]) {
      return interaction.reply({ content: "Tu as déjà envoyé un avis.", ephemeral: true });
    }

    data[userId] = {
      note,
      content,
      date: Date.now()
    };

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    const stars = "⭐".repeat(note) + "☆".repeat(5 - note);

    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle(`Nouvel avis de ${interaction.user.username}`)
      .setDescription("Cet avis est subjectif.")
      .addFields(
        {
          name: "Note",
          value: `${stars} (${note}/5)`
        },
        {
          name: "Commentaire",
          value: `\`\`\`${content}\`\`\``
        }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setFooter({ text: `ID: ${interaction.user.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`review_delete_${userId}`)
        .setLabel('Supprimer')
        .setStyle(ButtonStyle.Danger)
    );

    const channel = interaction.client.channels.cache.get(REVIEW_CHANNEL_ID);
    if (!channel) {
      return interaction.reply({ content: "Salon introuvable.", ephemeral: true });
    }

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({ content: "Avis envoyé." });
  }
};
