module.exports = {
  name: "interactionCreate",

  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(
      interaction.commandName
    );

    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);

      if (interaction.replied) {
        await interaction.followUp({
          content: "❌ Có lỗi xảy ra.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "❌ Có lỗi xảy ra.",
          ephemeral: true,
        });
      }
    }
  },
};