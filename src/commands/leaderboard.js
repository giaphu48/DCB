// src/commands/leaderboard.js

const db =
    require('../database/fishing');

const {

    EmbedBuilder,

    ActionRowBuilder,

    ButtonBuilder,

    ButtonStyle

} = require('discord.js');

module.exports = {

    name: 'leaderboard',

    aliases: ['lb', 'top'],

    category: 'economy',

    description:
        'Xem leaderboard server',

    async execute(message) {

        //
        // TYPE
        //

        let type = 'money';

        //
        // PAGE
        //

        let currentPage = 0;

        const pageSize = 10;

        //
        // GET DATA
        //

        const getLeaderboard = async () => {

            //
            // GET USERS
            //

            const users = db.prepare(`

                SELECT *
                FROM users

                ORDER BY

                ${type === 'money'

                    ? 'money DESC'

                    : 'level DESC, xp DESC'
                }

            `).all();

            //
            // FILTER SERVER MEMBERS
            //

            const filtered = users.filter(

                user =>

                    message.guild.members.cache.has(
                        user.user_id
                    )
            );

            return filtered;


            console.log(filtered);

            return filtered;
        };

        //
        // BUILD EMBED
        //

        const buildEmbed = async () => {

            const leaderboard =
                await getLeaderboard();

            //
            // PAGES
            //

            const pages = [];

            for (

                let i = 0;

                i < leaderboard.length;

                i += pageSize

            ) {

                pages.push(

                    leaderboard.slice(
                        i,
                        i + pageSize
                    )
                );
            }

            //
            // CURRENT PAGE
            //

            const current =
                pages[currentPage] || [];

            //
            // DESCRIPTION
            //

            let description = '';

            //
            // EMPTY
            //

            if (!current.length) {

                description =
                    'Không có dữ liệu';
            }

            //
            // BUILD
            //

            else {

                for (

                    let i = 0;

                    i < current.length;

                    i++

                ) {

                    const user =
                        current[i];

                    const rank =

                        currentPage *
                        pageSize +

                        i + 1;

                    //
                    // VALUE
                    //

                    const value =

                        type === 'money'

                            ? `💰 ${user.money}$`

                            : `⭐ Lv.${user.level} (${user.xp} XP)`;

                    //
                    // ADD
                    //

                    description +=

                        `#${rank} ` +

                        `**${message.guild.members.cache .get(user.user_id) ?.displayName || 'Unknown User'}**\n` +

                        `${value}\n\n`;
                }
            }

            //
            // EMBED
            //

            return {

                embed:

                    new EmbedBuilder()

                        .setColor(

                            type === 'money'

                                ? 'Gold'

                                : 'Blue'
                        )

                        .setTitle(

                            type === 'money'

                                ? '💰 Money Leaderboard'

                                : '⭐ Level Leaderboard'
                        )

                        .setDescription(
                            description
                        )

                        .setFooter({

                            text:

                                `Trang ${currentPage + 1}/${Math.max(pages.length, 1)}`
                        }),

                totalPages:
                    Math.max(
                        pages.length,
                        1
                    )
            };
        };

        //
        // BUTTONS
        //

        const buildButtons = totalPages => {

            return new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId('money')

                        .setLabel('💰 Money')

                        .setStyle(

                            type === 'money'

                                ? ButtonStyle.Primary

                                : ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()

                        .setCustomId('level')

                        .setLabel('⭐ Level')

                        .setStyle(

                            type === 'level'

                                ? ButtonStyle.Primary

                                : ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()

                        .setCustomId('prev')

                        .setLabel('◀')

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                        .setDisabled(
                            currentPage <= 0
                        ),

                    new ButtonBuilder()

                        .setCustomId('next')

                        .setLabel('▶')

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                        .setDisabled(
                            currentPage >=
                            totalPages - 1
                        )
                );
        };

        //
        // FIRST BUILD
        //

        const {

            embed,

            totalPages

        } = await buildEmbed();

        //
        // SEND
        //

        const msg =
            await message.reply({

                embeds: [embed],

                components: [
                    buildButtons(
                        totalPages
                    )
                ]
            });

        //
        // COLLECTOR
        //

        const collector =
            msg.createMessageComponentCollector({

                time: 60000
            });

        //
        // INTERACTION
        //

        collector.on(

            'collect',

            async interaction => {

                //
                // ONLY AUTHOR
                //

                if (

                    interaction.user.id !==
                    message.author.id

                ) {

                    return interaction.reply({

                        content:
                            '❌ Đây không phải leaderboard của bạn',

                        ephemeral: true
                    });
                }

                //
                // TYPE
                //

                if (

                    interaction.customId ===
                    'money'

                ) {

                    type = 'money';

                    currentPage = 0;
                }

                if (

                    interaction.customId ===
                    'level'

                ) {

                    type = 'level';

                    currentPage = 0;
                }

                //
                // PAGE
                //

                if (

                    interaction.customId ===
                    'prev'

                ) {

                    currentPage--;
                }

                if (

                    interaction.customId ===
                    'next'

                ) {

                    currentPage++;
                }

                //
                // REBUILD
                //

                const {

                    embed,

                    totalPages

                } = await buildEmbed();

                //
                // UPDATE
                //

                await interaction.update({

                    embeds: [embed],

                    components: [
                        buildButtons(
                            totalPages
                        )
                    ]
                });
            }
        );

        //
        // END
        //

        collector.on(

            'end',

            async () => {

                try {

                    await msg.edit({

                        components: []
                    });

                } catch { }
            }
        );
    }
};