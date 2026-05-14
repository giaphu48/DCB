const { QuickDB } = require("quick.db");
const { category } = require("./fish");
const db = new QuickDB();

module.exports = {
  name: "prefix",

  category: "admin",
  
  description:
    "Đổi prefix của bot trong server này. Chỉ dành cho Administrator.",

  async execute(message, args) {
    if (!message.member.permissions.has("Administrator")) {
      return message.reply("Bạn không có quyền Administrator.");
    }

    const newPrefix = args[0];

    if (!newPrefix) {
      return message.reply("Vui lòng nhập prefix mới.");
    }

    if (newPrefix.length > 5) {
      return message.reply("Prefix tối đa 5 ký tự.");
    }

    await db.set(`prefix_${message.guild.id}`, newPrefix);

    message.reply(`Prefix đã đổi thành: \`${newPrefix}\``);
  },
};