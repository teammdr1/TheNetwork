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
    name: 'cry',
    description: 'Exprime que tu pleures 😢',

    async execute(client, message, args) {

        // Liste de GIFs/Images cry
        const gifs = [
            'https://media1.tenor.com/m/VO2in_SxlvAAAAAC/sad-taiga-aisaka.gif',
            'https://i.pinimg.com/originals/6b/d7/38/6bd73801b4f4eff060238e39a523505f.gif',
            'https://64.media.tumblr.com/ac30028251d464fda7a6ccd16cfba6d7/tumblr_o936vjsHxK1uvva9wo1_500.gif',
            'https://giffiles.alphacoders.com/353/35360.gif',
            'https://i.pinimg.com/originals/0f/7b/43/0f7b43b390702ac6b3280a8999f38b2d.gif'
        ];

        const gif = gifs[Math.floor(Math.random() * gifs.length)];

        const embed = new EmbedBuilder()
            .setTitle(`${message.author.username} est en train de pleurer 😢`)
            .setImage(gif)
            .setColor('#5865F2')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
