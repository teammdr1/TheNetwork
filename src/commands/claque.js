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

const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'claque',
    description: 'Fais une claque à quelqu’un 😏',

    async execute(client, message, args) {
        const member = message.mentions.members.first();
        if (!member) return message.reply("❌ Mentionne un membre à claquer !");
        const gifs = [
            'https://media.tenor.com/KR4LZDvzVH0AAAAM/slap-anime-slap.gif',
            'https://animesher.com/orig/1/140/1406/14064/animesher.com_slap-gif-highschool-of-the-dead-1406478.gif',
            'https://i.gifer.com/5m62.gif',
            'https://i.imgur.com/EozsOgA.gif'
        ];
        const gif = gifs[Math.floor(Math.random() * gifs.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${message.author.username} claque ${member.user.username} ! 😏`)
            .setImage(gif)
            .setColor('#FF0000')
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};
