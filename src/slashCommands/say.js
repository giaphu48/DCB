const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const logger = require(
  "../utils/logger"
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription(
      "Bot gửi tin nhắn thay bạn"
    )

    .addStringOption(option =>
      option
        .setName("message")
        .setDescription(
          "Nội dung tin nhắn"
        )
        .setRequired(true)
    )

    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    )

    .setDMPermission(false),

  async execute(interaction) {

    //
    // GET MESSAGE
    //

    const text =
      interaction.options.getString(
        "message"
      );

    //
    // LOG
    //

    const logger = require(
  "../utils/logger"
);

logger.command(`
User   : ${interaction.user.tag}
UserID : ${interaction.user.id}

Guild  : ${interaction.guild.name}
GuildID: ${interaction.guild.id}

Channel: #${interaction.channel.name}

Command: /say

Message:
${text}
`);

    //
    // REPLY
    //

    await interaction.reply({
      content: "✅ Đã gửi tin nhắn.",
      ephemeral: true,
    });

    //
    // SEND
    //

    await interaction.channel.send(text);
  },
};