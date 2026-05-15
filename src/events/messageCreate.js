const getPrefix = require("../utils/getPrefix");
const escapeRegex = require("../utils/escapeRegex");

module.exports = {
  name: "messageCreate",

  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    const prefix = await getPrefix(message.guild.id);

    const escapedPrefix = escapeRegex(prefix);

    const prefixRegex = new RegExp(
      `^(<@!?${client.user.id}>|${escapedPrefix})\\s*`,
      'i'
    );

    if (!prefixRegex.test(message.content)) return;

    const matchedPrefix = message.content.match(prefixRegex)[0];

    const args = message.content
      .slice(matchedPrefix.length)
      .trim()
      .split(/ +/);

    const commandName = args.shift()?.toLowerCase();

    // Nếu chỉ mention bot
    // Nếu chỉ mention bot
    if (!commandName) {

      const isMentionOnly =
        new RegExp(
          `^<@!?${client.user.id}>\\s*$`
        ).test(message.content);

      if (isMentionOnly) {

        return message.reply(
          `Prefix hiện tại là: \`${prefix}\``
        );
      }

      return;
    }

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(error);

      message.reply("❌ Có lỗi xảy ra khi chạy command.");
    }
  },
};