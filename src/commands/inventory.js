const db =
    require('../database/fishing');

const {

    EmbedBuilder,

    ActionRowBuilder,

    ButtonBuilder,

    ButtonStyle

} = require('discord.js');

module.exports = {

    name: 'inventory',

    aliases: ['inv', 'bag'],

    category: 'economy',

    description:
        'Xem inventory',

    async execute(message) {

        const userId =
            message.author.id;

        //
        // GET INVENTORY
        //

        const items = db.prepare(`
            SELECT *
            FROM inventory
            WHERE user_id = ?
            AND amount >= 0
            ORDER BY rarity DESC
        `).all(userId);

        //
        // EMPTY
        //

        if (!items.length) {

            return message.reply(
                '🎒 Inventory trống'
            );
        }

        //
        // PAGINATION
        //

        const pageSize = 7;

        const pages = [];

        for (

            let i = 0;

            i < items.length;

            i += pageSize

        ) {

            pages.push(

                items.slice(
                    i,
                    i + pageSize
                )
            );
        }

        //
        // CURRENT PAGE
        //

        let currentPage = 0;

        //
        // BUILD EMBED
        //

        const buildEmbed = () => {

            const pageItems =
                pages[currentPage];

            let description = '';

            //
            // ITEMS
            //

            for (const item of pageItems) {

                //
                // SHINY
                //

                const shiny =
                    item.shiny
                        ? '✨ '
                        : '';

                //
                // RARITY
                //

                const rarity =

                    item.rarity

                        ? `(${item.rarity})`

                        : '';

                description +=

                    `${shiny}**${item.fish_name}** ` +

                    `x${item.amount} ` +

                    `${rarity}\n`;
            }

            //
            // EMBED
            //

            return new EmbedBuilder()

                .setColor('Blue')

                .setTitle(

                    `🎒 Túi của ${message.author.displayName}`

                )

                .setDescription(description)

                .setFooter({

                    text:

                        `Trang ${currentPage + 1}/${pages.length}`
                });
        };

        //
        // BUTTONS
        //

        const getButtons = () => {

            return new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId('prev')

                        .setLabel('◀')

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                        .setDisabled(
                            currentPage === 0
                        ),

                    new ButtonBuilder()

                        .setCustomId('next')

                        .setLabel('▶')

                        .setStyle(
                            ButtonStyle.Secondary
                        )

                        .setDisabled(
                            currentPage ===
                            pages.length - 1
                        )
                );
        };

        //
        // SEND
        //

        const msg =
            await message.reply({

                embeds: [
                    buildEmbed()
                ],

                components: [
                    getButtons()
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
        // COLLECT
        //

        collector.on(
            'collect',

            async interaction => {

                //
                // ONLY AUTHOR
                //

                if (
                    interaction.user.id !==
                    userId
                ) {

                    return interaction.reply({

                        content:
                            '❌ Đây không phải inventory của bạn',

                        ephemeral: true
                    });
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
                // UPDATE
                //

                await interaction.update({

                    embeds: [
                        buildEmbed()
                    ],

                    components: [
                        getButtons()
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