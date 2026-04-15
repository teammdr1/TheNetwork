const fs = require("fs");
const path = require("path");
const PREVNAMES_FILE = path.join(__dirname, "../../data/prevnames.json");

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember) {
    if (oldMember.nickname === newMember.nickname) return;
    let data = {};
    if (fs.existsSync(PREVNAMES_FILE)) {
      data = JSON.parse(fs.readFileSync(PREVNAMES_FILE, "utf8"));
    }
    const guildId = newMember.guild.id;
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][newMember.id]) data[guildId][newMember.id] = [];
    const oldName = oldMember.nickname || oldMember.user.username;
    data[guildId][newMember.id].push({ name: oldName, date: Date.now() });
    fs.writeFileSync(PREVNAMES_FILE, JSON.stringify(data, null, 4));
  }
};
