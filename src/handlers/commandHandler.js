const fs = require("fs");
const path = require("path");

module.exports = (client) => {

    client.commands = new Map();

    const commandFiles = fs
        .readdirSync(
            path.join(__dirname, "../commands")
        )
        .filter(file =>
            file.endsWith(".js")
        );

    for (const file of commandFiles) {

        const command = require(
            `../commands/${file}`
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
            `Loaded command: ${command.name}`
        );

        // DEBUG

        if (command.aliases) {

            console.log(
                `Aliases: ${command.aliases.join(', ')}`
            );
        }
    }
};