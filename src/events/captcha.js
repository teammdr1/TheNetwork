const guildConfig = require('../utils/guildConfig');

module.exports = {
    name: "guildMemberAdd",
    async execute(member, client) {
        if (!guildConfig.get(member.guild.id, 'captchaEnabled')) return;

        if (member.roles.cache.size === 1) {
            try {
                await member.send("Merci de passer la vérification captcha.");
            } catch {
                await member.kick("Captcha non complété");
            }
        }
    }
};
