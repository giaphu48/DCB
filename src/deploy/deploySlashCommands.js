require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { REST, Routes } = require("discord.js");

module.exports = async (client) => {
  try {
    const commands = [];

    //
    // LOAD COMMAND FILES
    //

    const slashPath = path.join(
      __dirname,
      "../slashCommands"
    );

    const slashFiles = fs
      .readdirSync(slashPath)
      .filter(file => file.endsWith(".js"));

    for (const file of slashFiles) {
      const command = require(
        `../slashCommands/${file}`
      );

      commands.push(command.data.toJSON());

      console.log(
        `Loaded slash command: ${command.data.name}`
      );
    }

    //
    // REST
    //

    const rest = new REST({
      version: "10",
    }).setToken(process.env.TOKEN);

    //
    // DELETE OLD COMMANDS
    //

    console.log("🗑 Removing old slash commands...");

    await rest.put(
      Routes.applicationCommands(client.user.id),
      {
        body: [],
      }
    );

    console.log("✅ Old slash commands removed.");

    //
    // DEPLOY NEW COMMANDS
    //

    console.log(
      `🚀 Deploying ${commands.length} slash commands...`
    );

    await rest.put(
      Routes.applicationCommands(client.user.id),
      {
        body: commands,
      }
    );

    console.log("✅ Slash commands deployed.");
  } catch (error) {
    console.error(error);
  }
};