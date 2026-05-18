const fs = require("fs");
const path = require("path");

const {
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { category } = require("./fish");

module.exports = {
  name: "chichdien",

  aliases: ["campuchia", "cam"],

  category: "fun",

  description:
    "Chích điện một người nào đó bằng một GIF ngẫu nhiên.",

  async execute(message) {

    //
    // TARGET
    //

    const target =
      message.mentions.users.first();

    if (!target) {
      return message.reply(
        "❌ Hãy tag một người."
      );
    }

    //
    // GIF FOLDER
    //

    const gifFolder = path.join(
      __dirname,
      "../assets/chichdien"
    );

    //
    // GET FILES
    //

    const files = fs
      .readdirSync(gifFolder)
      .filter(file =>
        file.endsWith(".gif")
      );

    //
    // RANDOM FILE
    //

    const randomFile =
      files[
        Math.floor(
          Math.random() * files.length
        )
      ];

    //
    // FILE PATH
    //

    const filePath = path.join(
      gifFolder,
      randomFile
    );

    //
    // ATTACHMENT
    //

    const attachment =
      new AttachmentBuilder(filePath, {
        name: randomFile,
      });

    //
    // EMBED
    //

    const embed =
      new EmbedBuilder()

        .setColor("Red")

        .setDescription(
          `${target} đang bị chích điện!`
        )

        .setImage(
          `attachment://${randomFile}`
        )

        .setTimestamp();

    //
    // SEND
    //

    await message.channel.send({
      embeds: [embed],
      files: [attachment],
    });
  },
};