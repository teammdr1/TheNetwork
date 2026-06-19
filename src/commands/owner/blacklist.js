const {
    PermissionsBitField,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
} = require('discord.js');
const guildConfig = require('../../utils/guildConfig');

module.exports = {
    name: "blacklist",
    description: "Ajouter ou retirer un utilisateur de la blacklist (ban)",
    usage: "+blacklist <add | remove> <userID>",

    async execute(client, message, args) {

        // Owner only
        if (message.author.id !== guildConfig.getAll(message.guild.id).botOwners[0]) {
            return message.reply("Tu n'as pas la permission d'utiliser cette commande.");
        }

        if (args.length < 2) {
            return message.reply("Usage : +blacklist <add | remove> <userID>");
        }

        const subcommand = args[0].toLowerCase();
        const userId = args[1];

        if (subcommand === "add") {
            if (guildConfig.getAll(message.guild.id).blacklist.includes(userId)) {
                return message.reply(`L'utilisateur avec l'ID ${userId} est déjà dans la blacklist.`);
            }
            else {
                guildConfig.getAll(message.guild.id).blacklist.push(userId);
                const container = new ContainerBuilder().setAccentColor(0xFF0000);
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## 🚫 Blacklist — ${message.guild.name}`)
                )
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`L'utilisateur avec l'ID ${userId} a été ajouté à la blacklist.`)
                )
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
        } else if (subcommand === "remove") {
            if (!guildConfig.getAll(message.guild.id).blacklist.includes(userId)) {
                return message.reply(`L'utilisateur avec l'ID ${userId} n'est pas dans la blacklist.`);
            }
            else {
                guildConfig.getAll(message.guild.id).blacklist = guildConfig.getAll(message.guild.id).blacklist.filter(id => id !== userId);
                const container = new ContainerBuilder().setAccentColor(0x00FF00);
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## ✅ Blacklist — ${message.guild.name}`)
                )
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`L'utilisateur avec l'ID ${userId} a été retiré de la blacklist.`)
                )
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
        } else if (subcommand === "liste") {
            if (guildConfig.getAll(message.guild.id).blacklist.length === 0) {
                return message.reply("La blacklist est vide.");
            }
            if (guildConfig.getAll(message.guild.id).blacklist.length > 0) {
                const container = new ContainerBuilder().setAccentColor(0xFFFF00);
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`## 📋 Blacklist — ${message.guild.name}`)
                )
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(1).setDivider(true));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`Liste des utilisateurs dans la blacklist :\n${guildConfig.getAll(message.guild.id).blacklist.join("\n")}`)
                )
                return message.channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
        } else {
            return message.reply("Usage : +blacklist <add | remove | liste> <userID>");
        }
}}
