require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { REST, Routes } = require("discord.js");

module.exports = async (client) => {
  try {
    const commands = [];

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

    const rest = new REST({
      version: "10",
    }).setToken(process.env.TOKEN);

    console.log("🗑 Removing old guild commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        client.user.id,
        process.env.GUILD_ID
      ),
      {
        body: [],
      }
    );

    console.log("✅ Old guild commands removed.");

    console.log(
      `🚀 Deploying ${commands.length} guild commands...`
    );

    await rest.put(
      Routes.applicationGuildCommands(
        client.user.id,
        process.env.GUILD_ID
      ),
      {
        body: commands,
      }
    );

    console.log("✅ Guild commands deployed.");
  } catch (error) {
    console.error(error);
  }
};

