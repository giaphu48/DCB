const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("isv")
    .setDescription("Tính chỉ số ISV dựa trên team của bạn")

    .addNumberOption(option =>
      option
        .setName("leader")
        .setDescription("Leader")
        .setRequired(true)
    )

    .addNumberOption(option =>
      option
        .setName("card2")
        .setDescription("Card 2")
        .setRequired(true)
    )

    .addNumberOption(option =>
      option
        .setName("card3")
        .setDescription("Card 3")
        .setRequired(false)
    )

    .addNumberOption(option =>
      option
        .setName("card4")
        .setDescription("Card 4")
        .setRequired(false)
    )

    .addNumberOption(option =>
      option
        .setName("card5")
        .setDescription("Card 5")
        .setRequired(false)
    ),

  async execute(interaction) {
    // Bắt buộc
    const s1 = interaction.options.getNumber("leader");
    const s2 = interaction.options.getNumber("card2");

    // Optional
    const s3 = interaction.options.getNumber("card3") || 0;
    const s4 = interaction.options.getNumber("card4") || 0;
    const s5 = interaction.options.getNumber("card5") || 0;

    // Công thức
    const isv = s1 + (s2 + s3 + s4 + s5) / 5;

    // Reply
    await interaction.reply(
      `ISV của bạn là: \`${isv}%\``
    );
  },
};