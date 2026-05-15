const fs = require("fs");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

const {
  Client,
  Collection,
  GatewayIntentBits,
} = require("discord.js");

const deploySlashCommands = require(
  "./src/deploy/deploySlashCommands"
);
// const deployGuildSlashCommands = require('./src/deploy/deployGuildSlashCommands');

//
// CLIENT
//

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

//
// COLLECTIONS
//

client.commands = new Collection();
client.slashCommands = new Collection();

//
// LOAD NORMAL COMMANDS
//

//
// LOAD NORMAL COMMANDS
//

const commandPath = path.join(
  __dirname,
  "./src/commands"
);

const commandFiles = fs
  .readdirSync(commandPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

  const command = require(
    `./src/commands/${file}`
  );

  // MAIN COMMAND

  client.commands.set(
    command.name,
    command
  );

  // ALIASES

  if (command.aliases) {

    for (const alias of command.aliases) {

      client.commands.set(
        alias,
        command
      );
    }
  }

  console.log(
    `✅ Loaded command: ${command.name}`
  );

  // DEBUG

  if (command.aliases) {

    console.log(
      `   ↳ Aliases: ${command.aliases.join(", ")}`
    );
  }
}

//
// LOAD SLASH COMMANDS
//

const slashPath = path.join(
  __dirname,
  "./src/slashCommands"
);

const slashFiles = fs
  .readdirSync(slashPath)
  .filter(file => file.endsWith(".js"));

for (const file of slashFiles) {

  const command = require(
    `./src/slashCommands/${file}`
  );

  client.slashCommands.set(
    command.data.name,
    command
  );

  console.log(
    `✅ Loaded slash command: ${command.data.name}`
  );
}

//
// LOAD EVENTS
//

const eventPath = path.join(
  __dirname,
  "./src/events"
);

const eventFiles = fs
  .readdirSync(eventPath)
  .filter(file => file.endsWith(".js"));

for (const file of eventFiles) {

  const event = require(
    `./src/events/${file}`
  );

  client.on(event.name, (...args) =>
    event.execute(...args, client)
  );

  console.log(
    `✅ Loaded event: ${event.name}`
  );
}

//
// READY
//

client.login(process.env.TOKEN);

client.once("clientReady", async () => {

  console.log(
    `✅ Logged in as ${client.user.tag}`
  );

  //
  // DEPLOY SLASH COMMANDS
  //

  // await deploySlashCommands(client);
  // await deployGuildSlashCommands(client, );

});

//
// LOGIN
//

