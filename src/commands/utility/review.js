const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const REVIEW_CHANNEL_ID = "1495351088126361611"; // ← mets ton salon ici
const DATA_PATH = path.join(__dirname, '../data/reviews.json');

module.exports = {
  name: 'review',

  async execute(client, message, args) {
    const note = parseInt(args[0]);
    const content = args.slice(1).join(" ");

    if (!note || note < 1 || note > 5) {
      return message.reply("Note entre 1 et 5.");
    }

    if (!content) {
      return message.reply("Ajoute un commentaire.");
    }

    // 📥 charger JSON
    let data = {};
    if (fs.existsSync(DATA_PATH)) {
      data = JSON.parse(fs.readFileSync(DATA_PATH));
    }

    const userId = message.author.id;

    // ❌ empêche double review (optionnel)
    if (data[userId]) {
      return message.reply("Tu as déjà envoyé un avis.");
    }

    // 💾 stocker
    data[userId] = {
      note: note,
      content: content,
      date: Date.now()
    };

    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    // ⭐ étoiles
    const stars = "⭐".repeat(note) + "☆".repeat(5 - note);

    // 🧾 embed
    const embed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setTitle(`Nouvel avis de ${message.author.username}`)
      .setDescription("Cet avis est subjectif et reflète l'expérience personnelle de son auteur.")
      .addFields(
        {
          name: "Note :",
          value: `${stars} (${note}/5)`
        },
        {
          name: "Commentaire :",
          value: `\`\`\`yaml\n${content}\n\`\`\``
        }
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `ID: ${message.author.id}` })
      .setTimestamp();

    // 🔘 boutons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`review_delete_${userId}`)
        .setLabel('Supprimer')
        .setStyle(ButtonStyle.Danger)
    );

    const channel = client.channels.cache.get(REVIEW_CHANNEL_ID);
    if (!channel) return message.reply("Salon introuvable.");

    await channel.send({
      embeds: [embed],
      components: [row]
    });

    message.reply("Avis envoyé.");
  }
};
