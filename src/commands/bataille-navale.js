// ▄▄▄█████▓▓█████ ▄▄▄       ███▄ ▄███▓ ███▄ ▄███▓▓█████▄  ██▀███  
// ▓  ██▒ ▓▒▓█   ▀▒████▄    ▓██▒▀█▀ ██▒▓██▒▀█▀ ██▒▒██▀ ██▌▓██ ▒ ██▒
// ▒ ▓██░ ▒░▒███  ▒██  ▀█▄  ▓██    ▓██░▓██    ▓██░░██   █▌▓██ ░▄█ ▒
// ░ ▓██▓ ░ ▒▓█  ▄░██▄▄▄▄██ ▒██    ▒██ ▒██    ▒██ ░▓█▄   ▌▒██▀▀█▄  
//   ▒██▒ ░ ░▒████▒▓█   ▓██▒▒██▒   ░██▒▒██▒   ░██▒░▒████▓ ░██▓ ▒██▒
//   ▒ ░░   ░░ ▒░ ░▒▒   ▓▒█░░ ▒░   ░  ░░ ▒░   ░  ░ ▒▒▓  ▒ ░ ▒▓ ░▒▓░
//     ░     ░ ░  ░ ▒   ▒▒ ░░  ░      ░░  ░      ░ ░ ▒  ▒   ░▒ ░ ▒░
//   ░         ░    ░   ▒   ░      ░   ░      ░    ░ ░  ░   ░░   ░ 
//             ░  ░     ░  ░       ░          ░      ░       ░     
//                                                ░                                                  
//=======================================================================                                                                      
//● Crée par xbloxet sur Discord
//● Serveur Discord: https://discord.gg/kn5RXkUdPU
//● Github: https://github.com/teammdr1                                                  
//● Licence: MIT (projet libre)
//=======================================================================

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "bataille-navale",
    description: "Joue à la bataille navale",
    async execute(message, args) {
        const opponent = message.mentions.users.first();
        if (!opponent) return message.reply("Mentionne un joueur.");
        if (opponent.bot) return message.reply("Tu ne peux pas jouer contre un bot.");
        if (opponent.id === message.author.id) return message.reply("Impossible de jouer contre toi-même.");
        const players = [message.author.id, opponent.id];
        let currentPlayer = 0;
        const size = 3;
        const boards = [
            Array(size * size).fill("🌊"),
            Array(size * size).fill("🌊")
        ];
        const ships = [
            Math.floor(Math.random() * 9),
            Math.floor(Math.random() * 9)
        ];
        function createBoard() {
            const rows = [];
            for (let i = 0; i < size; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < size; j++) {
                    const index = i * size + j;
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`naval_${index}`)
                            .setLabel(" ")
                            .setStyle(ButtonStyle.Secondary)
                    );
                }
                rows.push(row);
            }
            return rows;
        }
        const embed = new EmbedBuilder()
            .setTitle("Bataille Navale")
            .setDescription(`Tour de <@${players[currentPlayer]}>`);
        const gameMessage = await message.channel.send({
            embeds: [embed],
            components: createBoard()
        });
        const collector = gameMessage.createMessageComponentCollector({
            time: 600000
        });
        collector.on("collect", async interaction => {
            if (!players.includes(interaction.user.id)) {
                return interaction.reply({ content: "Tu ne joues pas.", ephemeral: true });
            }
            if (interaction.user.id !== players[currentPlayer]) {
                return interaction.reply({ content: "Ce n'est pas ton tour.", ephemeral: true });
            }
            const index = parseInt(interaction.customId.split("_")[1]);
            const enemy = currentPlayer === 0 ? 1 : 0;
            if (boards[enemy][index] !== "🌊") {
                return interaction.reply({ content: "Case déjà attaquée.", ephemeral: true });
            }
            if (ships[enemy] === index) {
                boards[enemy][index] = "💥";
                embed.setDescription(`<@${players[currentPlayer]}> a touché le bateau et gagne la partie !`);
                collector.stop();
                return interaction.update({
                    embeds: [embed],
                    components: []
                });
            } else {
                boards[enemy][index] = "❌";
                currentPlayer = enemy;
                embed.setDescription(`Raté. Tour de <@${players[currentPlayer]}>`);
                await interaction.update({
                    embeds: [embed],
                    components: createBoard()
                });
            }
        });

    }
};
