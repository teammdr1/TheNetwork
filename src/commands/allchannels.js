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

// src/commands/allchannels.js
module.exports = {
  name: 'allchannels',
    description: 'Dit il y a combvien de channels sur le serveur',
    async execute(client, message, args) {
        const channelCount = message.guild.channels.cache.size;
        return message.reply(`Il y a ${channelCount} channels sur ce serveur.`);
    },
};
