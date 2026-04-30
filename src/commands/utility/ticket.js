const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    PermissionsBitField,
} = require("discord.js");
const guildConfig = require("../../utils/guildConfig");
const { randomUUID } = require("crypto");

function slugify(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 20);
}

function getCat(categories, name) {
    return categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

async function sendPanel(channel, guild) {
    const cfg = guildConfig.getAll(guild.id);
    const tc = cfg.ticketConfig;

    if (!tc.categories || tc.categories.length === 0) {
        throw new Error(
            "Aucune catégorie de ticket configurée. Utilisez `+ticket addcat <nom>`.",
        );
    }

    const categoriesText = tc.categories
        .map((cat) => {
            return `**${cat.emoji || "🎫"} ${cat.name}**\n${cat.description || "Aucune description"}`;
        })
        .join("\n\n");

    const embed = new EmbedBuilder()
        .setTitle(`Support ${guild.name}`)
        .setColor(tc.panelColor || "#5865F2")
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setDescription(
            `${tc.panelDescription || "Choisissez une catégorie pour ouvrir un ticket."}\n\n` +
            `${categoriesText}\n\n` +
            `👇 Sélectionnez une catégorie ci-dessous`
        )
        .setFooter({
            text: guild.name,
            iconURL: guild.iconURL({ dynamic: true }),
        })
        .setTimestamp();

    let components;

    if (tc.categories.length === 1) {
        const cat = tc.categories[0];
        components = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_create_${cat.id}`)
                    .setLabel("Créer un ticket")
                    .setEmoji(cat.emoji || "🎫")
                    .setStyle(ButtonStyle.Primary),
            ),
        ];
    } else {
        components = [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("ticket_select_category")
                    .setPlaceholder("Choisir une catégorie...")
                    .addOptions(
                        tc.categories.map((cat) => ({
                            label: cat.name,
                            value: cat.id,
                            description:
                                cat.description?.slice(0, 80) ||
                                "Ouvrir un ticket",
                            emoji: cat.emoji || "🎫",
                        })),
                    ),
            ),
        ];
    }

    return channel.send({ embeds: [embed], components });
}

module.exports = {
    name: "ticket",
    description: "Gestion du système de tickets",
    async execute(client, message, args) {
        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.Administrator,
            )
        ) {
            return message.reply(
                "❌ Vous devez être administrateur pour configurer les tickets.",
            );
        }

        const sub = args[0]?.toLowerCase();
        const guildId = message.guild.id;
        const cfg = guildConfig.getAll(guildId);
        const tc = cfg.ticketConfig;
        const prefix = cfg.prefix || "+";

        // ===== PANEL =====
        if (sub === "panel") {
            const targetChannel =
                message.mentions.channels.first() || message.channel;
            try {
                await sendPanel(targetChannel, message.guild);
                if (targetChannel.id !== message.channel.id) {
                    message.reply(
                        `✅ Panneau de tickets envoyé dans ${targetChannel}.`,
                    );
                }
            } catch (err) {
                message.reply(`❌ ${err.message}`);
            }
            return;
        }

        // ===== ADD CATEGORY =====
        if (sub === "addcat") {
            const name = args[1];
            if (!name)
                return message.reply(
                    `❌ Utilisez : \`${prefix}ticket addcat <nom> [emoji] [description]\``,
                );

            if (getCat(tc.categories, name))
                return message.reply("❌ Cette catégorie existe déjà.");

            let emoji = null;
            let description = "";

            const possibleEmoji = args[2];

            // Détection emoji unicode + custom discord
            if (
                possibleEmoji &&
                (
                    /^<a?:\w+:\d+>$/.test(possibleEmoji) || // emoji custom
                    /\p{Extended_Pictographic}/u.test(possibleEmoji) // emoji unicode
                )
            ) {
                emoji = possibleEmoji;
                description = args.slice(3).join(" ");
            } else {
                description = args.slice(2).join(" ");
            }

            const newCat = {
                id: randomUUID().slice(0, 8),
                name,
                emoji, // peut être null
                description:
                    description || "Ouvrir un ticket pour cette catégorie.",
                staffRoles: [],
                discordCategoryId: null,
            };

            tc.categories.push(newCat);

            guildConfig.setNested(
                guildId,
                "ticketConfig",
                "categories",
                tc.categories,
            );

            return message.reply(
                `✅ Catégorie **${name}** créée.\nConfigurez-la avec :\n- \`${prefix}ticket setrole ${name} @Role\` — donner accès au staff\n- \`${prefix}ticket setcategory ${name} <ID>\` — catégorie Discord pour les channels\n- \`${prefix}ticket setdesc ${name} <description>\` — modifier la description`,
            );
        }

        // ===== REMOVE CATEGORY =====
        if (sub === "removecat") {
            const name = args.slice(1).join(" ");
            if (!name)
                return message.reply(
                    `❌ Utilisez : \`${prefix}ticket removecat <nom>\``,
                );
            const idx = tc.categories.findIndex(
                (c) => c.name.toLowerCase() === name.toLowerCase(),
            );
            if (idx === -1) return message.reply("❌ Catégorie introuvable.");
            tc.categories.splice(idx, 1);
            guildConfig.setNested(
                guildId,
                "ticketConfig",
                "categories",
                tc.categories,
            );
            return message.reply(`✅ Catégorie **${name}** supprimée.`);
        }

        // ===== SET ROLE FOR CATEGORY =====
        if (sub === "setrole") {
            const role = message.mentions.roles.first();
            const catName = args.slice(1, -1).join(" ") || args[1];
            if (!role)
                return message.reply(
                    `❌ Utilisez : \`${prefix}ticket setrole <catégorie> @Role\``,
                );
            const cat = getCat(tc.categories, catName);
            if (!cat)
                return message.reply(
                    "❌ Catégorie introuvable. Vérifiez avec `+ticket config`.",
                );
            if (!cat.staffRoles.includes(role.id)) cat.staffRoles.push(role.id);
            guildConfig.setNested(
                guildId,
                "ticketConfig",
                "categories",
                tc.categories,
            );
            return message.reply(
                `✅ ${role} peut maintenant accéder aux tickets **${cat.name}**.`,
            );
        }

        // ===== REMOVE ROLE FROM CATEGORY =====
        if (sub === "removerole") {
            const role = message.mentions.roles.first();
            const catName = args.slice(1, -1).join(" ") || args[1];
            if (!role)
                return message.reply(
                    `❌ Utilisez : \`${prefix}ticket removerole <catégorie> @Role\``,
                );
            const cat = getCat(tc.categories, catName);
            if (!cat) return message.reply("❌ Catégorie introuvable.");
            cat.staffRoles = cat.staffRoles.filter((id) => id !== role.id);
            guildConfig.setNested(
                guildId,
                "ticketConfig",
                "categories",
                tc.categories,
            );
            return message.reply(
                `✅ ${role} n'a plus accès aux tickets **${cat.name}**.`,
            );
        }

        // ===== SET DISCORD CATEGORY =====
        if (sub === "setcategory") {
            const catName = args[1];
            const discordCatId = args[2];
            if (!catName || !discordCatId)
                return message.reply(
                    `❌ Utilisez : \`${prefix}ticket setcategory <nom-catégorie> <ID-catégorie-Discord>\``,
                );
            const cat = getCat(tc.categories, catName);
            if (!cat)
                return message.reply("❌ Catégorie de ticket introuvable.");
            const discordCat = message.guild.channels.cache.get(discordCatId);
            if (!discordCat || discordCat.type !== 4)
                return message.reply(
                    '❌ ID de catégorie Discord invalide (type doit être "Catégorie").',
                );
            cat.discordCategoryId = discordCatId;
            guildConfig.setNested(
                guildId,
                "ticketConfig",
                "categories",
                tc.categories,
            );
            return message.reply(
                `✅ Les tickets **${cat.name}** seront créés dans la catégorie **${discordCat.name}**.`,
            );
        }

        // ===== SET DESCRIPTION =====
        if (sub === "setdesc") {
            const second = args[1];
            // Check if second arg is a category name
            const cat = second ? getCat(tc.categories, second) : null;
            if (cat) {
                const desc = args.slice(2).join(" ");
                if (!desc)
                    return message.reply(
                        `❌ Fournissez une description. Ex : \`${prefix}ticket setdesc ${cat.name} Ouvrez un ticket ici\``,
                    );
                cat.description = desc;
                guildConfig.setNested(
                    guildId,
                    "ticketConfig",
                    "categories",
                    tc.categories,
                );
                return message.reply(
                    `✅ Description de la catégorie **${cat.name}** mise à jour.`,
                );
            }
            // Otherwise set panel description
            const desc = args.slice(1).join(" ");
            if (!desc)
                return message.reply(
                    `❌ Fournissez une description. Ex : \`${prefix}ticket setdesc Mon texte ici\``,
                );
            guildConfig.setNested(
                guildId,
                "ticketConfig",
                "panelDescription",
                desc,
            );
            return message.reply("✅ Description du panneau mise à jour.");
        }

        // ===== SET COLOR =====
        if (sub === "setcolor") {
            const color = args[1];
            if (!color || !color.match(/^#[0-9a-fA-F]{6}$/))
                return message.reply(
                    `❌ Couleur invalide. Ex : \`${prefix}ticket setcolor #5865F2\``,
                );
            guildConfig.setNested(guildId, "ticketConfig", "panelColor", color);
            return message.reply(
                `✅ Couleur du panneau définie sur \`${color}\`.`,
            );
        }

        // ===== SET LOG CHANNEL =====
        if (sub === "setlog") {
            const channel = message.mentions.channels.first();
            if (!channel)
                return message.reply(
                    `❌ Mentionnez un salon. Ex : \`${prefix}ticket setlog #logs-tickets\``,
                );
            guildConfig.setNested(
                guildId,
                "ticketConfig",
                "logChannelId",
                channel.id,
            );
            return message.reply(`✅ Logs des tickets définis sur ${channel}.`);
        }

        // ===== CONFIG =====
        if (sub === "config") {
            const logCh = tc.logChannelId
                ? `<#${tc.logChannelId}>`
                : "❌ Non configuré";
            const catLines =
                tc.categories.length === 0
                    ? "❌ Aucune catégorie"
                    : tc.categories
                          .map((c) => {
                              const roles =
                                  c.staffRoles.length > 0
                                      ? c.staffRoles
                                            .map((r) => `<@&${r}>`)
                                            .join(", ")
                                      : "❌ Aucun";
                              const discordCat = c.discordCategoryId
                                  ? `<#${c.discordCategoryId}>`
                                  : "❌ Non définie";
                              return `**${c.emoji || "🎫"} ${c.name}** (ID: \`${c.id}\`)\nRôles staff: ${roles}\nCatégorie Discord: ${discordCat}\nDescription: ${c.description || "Aucune"}`;
                          })
                          .join("\n\n");

            const embed = new EmbedBuilder()
                .setTitle("🎫 Configuration des Tickets")
                .setColor(tc.panelColor || "#5865F2")
                .addFields(
                    { name: "📋 Logs tickets", value: logCh, inline: true },
                    {
                        name: "🎨 Couleur panel",
                        value: `\`${tc.panelColor || "#5865F2"}\``,
                        inline: true,
                    },
                    {
                        name: "📝 Description panel",
                        value: tc.panelDescription.slice(0, 200),
                        inline: false,
                    },
                    { name: "📂 Catégories", value: catLines, inline: false },
                )
                .setFooter({
                    text: `${prefix}ticket panel — pour envoyer le panneau dans un salon`,
                })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        // ===== HELP =====
        return message.reply(
            `**🎫 Système de Tickets — Commandes :**\n` +
                `\`${prefix}ticket panel [#salon]\` — Envoyer le panneau dans un salon\n` +
                `\`${prefix}ticket addcat <nom> [emoji] [description]\` — Créer une catégorie\n` +
                `\`${prefix}ticket removecat <nom>\` — Supprimer une catégorie\n` +
                `\`${prefix}ticket setrole <catégorie> @Role\` — Donner accès au staff\n` +
                `\`${prefix}ticket removerole <catégorie> @Role\` — Retirer un rôle staff\n` +
                `\`${prefix}ticket setcategory <catégorie> <ID>\` — Catégorie Discord pour les channels\n` +
                `\`${prefix}ticket setdesc [catégorie] <texte>\` — Modifier la description\n` +
                `\`${prefix}ticket setcolor <#hex>\` — Modifier la couleur\n` +
                `\`${prefix}ticket setlog #salon\` — Salon de logs\n` +
                `\`${prefix}ticket config\` — Voir la configuration`,
        );
    },
};
