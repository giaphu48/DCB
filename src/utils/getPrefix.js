const { QuickDB } = require("quick.db");
const db = new QuickDB();

const config = require("../config/config");

async function getPrefix(guildId) {
  if (!guildId) return config.defaultPrefix;

  const prefix = await db.get(`prefix_${guildId}`);

  return prefix || config.defaultPrefix;
}

module.exports = getPrefix;