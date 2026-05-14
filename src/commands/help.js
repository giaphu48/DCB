// src/commands/help.js

const {

    EmbedBuilder,

    ActionRowBuilder,

    StringSelectMenuBuilder

} = require('discord.js');

module.exports = {

    name: 'help',

    aliases: ['commands', 'cmds'],

    category: 'other',

    description:
        'Xem danh sách command',

    async execute(message, args, client) {

        //
        // ALL COMMANDS
        //

        const commands =
            [...new Set(
                client.commands.values()
            )];

        //
        // CATEGORIES
        //

        const categories = {

            fish: [],
            fun: [],
            quiz: [],
            economy: [],
            admin: [],
            other: []
        };

        //
        // SORT COMMANDS
        //

        for (const command of commands) {

            const category =
                command.category ||
                'other';

            if (!categories[category]) {

                categories.other.push(command);

                continue;
            }

            categories[category]
                .push(command);
        }

        //
        // CATEGORY EMBED
        //

        const createCategoryEmbed = (

            title,
            emoji,
            cmds

        ) => {

            return new EmbedBuilder()

                .setTitle(
                    `${emoji} ${title}`
                )

                .setColor('#00b0f4')

                .setDescription(

                    cmds.length

                        ? cmds.map(command => {

                            //
                            // ALIASES
                            //

                            const aliases =
                                command.aliases?.length

                                    ? ` (${command.aliases.join(', ')})`

                                    : '';

                            //
                            // DESCRIPTION
                            //

                            const description =
                                command.description ||

                                'Không có mô tả';

                            return (

                                `• \`${command.name}\`${aliases}\n` +

                                `└ ${description}`

                            );

                        }).join('\n\n')

                        : 'Không có command'
                )

                .setFooter({

                    text:
                        'Fishing MMORPG Bot'
                });
        };

        //
        // MAIN EMBED
        //

        const mainEmbed =
            new EmbedBuilder()

                .setTitle(
                    '📖 Help Menu'
                )

                .setColor('#00b0f4')

                .setDescription(

                    'Chọn category bên dưới để xem command.'
                )

                .addFields(

                    {
                        name: '🎣 Fish',
                        value:
                            `${categories.fish.length} commands`,
                        inline: true
                    },

                    {
                        name: '🎉 Fun',
                        value:
                            `${categories.fun.length} commands`,
                        inline: true
                    },

                    {
                        name: '🧠 Quiz',
                        value:
                            `${categories.quiz.length} commands`,
                        inline: true
                    },

                    {
                        name: '💰 Economy',
                        value:
                            `${categories.economy.length} commands`,
                        inline: true
                    },

                    {
                        name: '🛠️ Admin',
                        value:
                            `${categories.admin.length} commands`,
                        inline: true
                    },

                    {
                        name: '📦 Other',
                        value:
                            `${categories.other.length} commands`,
                        inline: true
                    }
                )

                .setFooter({

                    text:
                        'Fishing MMORPG Bot'
                });

        //
        // DROPDOWN MENU
        //

        const menu =
            new StringSelectMenuBuilder()

                .setCustomId(
                    'help_category'
                )

                .setPlaceholder(
                    '📂 Chọn category'
                )

                .addOptions([

                    {
                        label:
                            'Fishing Commands',

                        description:
                            'Các lệnh câu cá',

                        value:
                            'fish',

                        emoji:
                            '🎣'
                    },

                    {
                        label:
                            'Fun Commands',

                        description:
                            'Các lệnh giải trí',

                        value:
                            'fun',

                        emoji:
                            '🎉'
                    },

                    {
                        label:
                            'Quiz Commands',

                        description:
                            'Các lệnh quiz',

                        value:
                            'quiz',

                        emoji:
                            '🧠'
                    },

                    {
                        label:
                            'Economy Commands',

                        description:
                            'Các lệnh economy',

                        value:
                            'economy',

                        emoji:
                            '💰'
                    },

                    {
                        label:
                            'Admin Commands',

                        description:
                            'Các lệnh admin',

                        value:
                            'admin',

                        emoji:
                            '🛠️'
                    },

                    {
                        label:
                            'Other Commands',

                        description:
                            'Các lệnh khác',

                        value:
                            'other',

                        emoji:
                            '📦'
                    }

                ]);

        //
        // ROW
        //

        const row =
            new ActionRowBuilder()

                .addComponents(menu);

        //
        // SEND
        //

        const helpMessage =
            await message.reply({

                embeds: [mainEmbed],

                components: [row]
            });

        //
        // COLLECTOR
        //

        const collector =
            helpMessage.createMessageComponentCollector({

                time: 120000
            });

        //
        // COLLECT
        //

        collector.on(
            'collect',
            async interaction => {

                try {

                    //
                    // ACKNOWLEDGE
                    //

                    await interaction.deferUpdate();

                    //
                    // USER CHECK
                    //

                    if (

                        interaction.user.id !==
                        message.author.id

                    ) {

                        return;
                    }

                    //
                    // CATEGORY
                    //

                    const value =
                        interaction.values[0];

                    //
                    // EMBED
                    //

                    let embed;

                    switch (value) {

                        case 'fish':

                            embed =
                                createCategoryEmbed(

                                    'Fishing Commands',
                                    '🎣',
                                    categories.fish
                                );

                            break;

                        case 'fun':

                            embed =
                                createCategoryEmbed(

                                    'Fun Commands',
                                    '🎉',
                                    categories.fun
                                );

                            break;

                        case 'quiz':

                            embed =
                                createCategoryEmbed(

                                    'Quiz Commands',
                                    '🧠',
                                    categories.quiz
                                );

                            break;

                        case 'economy':

                            embed =
                                createCategoryEmbed(

                                    'Economy Commands',
                                    '💰',
                                    categories.economy
                                );

                            break;

                        case 'admin':

                            embed =
                                createCategoryEmbed(

                                    'Admin Commands',
                                    '🛠️',
                                    categories.admin
                                );

                            break;

                        case 'other':

                            embed =
                                createCategoryEmbed(

                                    'Other Commands',
                                    '📦',
                                    categories.other
                                );

                            break;

                        default:

                            embed = mainEmbed;
                    }

                    //
                    // EDIT
                    //

                    await helpMessage.edit({

                        embeds: [embed],

                        components: [row]
                    });

                } catch (err) {

                    console.error(err);
                }
            }
        );

        //
        // END
        //

        collector.on(
            'end',
            async () => {

                try {

                    //
                    // DISABLE MENU
                    //

                    menu.setDisabled(true);

                    const disabledRow =
                        new ActionRowBuilder()

                            .addComponents(menu);

                    //
                    // EDIT
                    //

                    await helpMessage.edit({

                        components: [disabledRow]

                    });

                } catch (err) {

                    console.error(err);
                }
            }
        );
    }
};