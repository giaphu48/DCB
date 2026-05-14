// src/commands/shop.js

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const db =
    require('../database/fishing');

const rods =
    require('../data/rods.json');

module.exports = {

    name: 'shop',

    aliases: ['store'],

    category: 'fish',

    description:
        'Xem cửa hàng cần câu và mua cần câu mới',

    async execute(message) {

        const userId =
            message.author.id;

        //
        // GET USER
        //

        let user =
            db.prepare(`
                SELECT * FROM users
                WHERE user_id = ?
            `).get(userId);

        //
        // CREATE USER
        //

        if (!user) {

            db.prepare(`
                INSERT INTO users (user_id)
                VALUES (?)
            `).run(userId);

            //
            // DEFAULT ROD
            //

            db.prepare(`
                INSERT INTO user_rods (
                    user_id,
                    rod_id
                )
                VALUES (?, ?)
            `).run(
                userId,
                'wooden_rod'
            );

            user =
                db.prepare(`
                    SELECT * FROM users
                    WHERE user_id = ?
                `).get(userId);
        }

        //
        // OWNED RODS
        //

        const ownedRods =
            db.prepare(`
                SELECT * FROM user_rods
                WHERE user_id = ?
            `).all(userId);

        //
        // EMBED
        //

        const embed =
            new EmbedBuilder()

                .setTitle(
                    '🎣 Fishing Shop'
                )

                .setColor('#00b0f4')

                .setDescription(
                    'Bấm nút để mua cần câu.'
                );

        //
        // BUTTON ROWS
        //

        const rows = [];

        let currentRow =
            new ActionRowBuilder();

        let buttonCount = 0;

        //
        // RODS
        //

        for (const rod of rods) {

            //
            // CHECK OWNED
            //

            const owned =
                ownedRods.find(
                    r =>
                        r.rod_id === rod.id
                );

            //
            // EMOJI
            //

            let emoji = '⚪';

            switch (rod.id) {

                case 'iron_rod':
                    emoji = '🟦';
                    break;

                case 'diamond_rod':
                    emoji = '🟪';
                    break;

                case 'mythic_rod':
                    emoji = '🟥';
                    break;
            }

            //
            // EMBED FIELD
            //

            embed.addFields({

                name:
                    `${emoji} ${rod.name}`,

                value:

                    `💰 ${Number(
                        rod.price || 0
                    ).toLocaleString('vi-VN')}$\n` +

                    `⭐ Rare Bonus: +${rod.rareBonus || 0}\n` +

                    `🎯 Catch Bonus: +${rod.catchBonus || 0}%\n` +

                    `✨ Shiny Bonus: +${rod.shinyBonus || 0}%\n` +

                    `⏱️ Cooldown: ${rod.cooldown / 1000}s\n\n` +

                    (
                        owned
                            ? '✅ Đã sở hữu'
                            : '❌ Chưa sở hữu'
                    ),

                inline: false
            });

            //
            // BUTTON
            //

            currentRow.addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        `buy_${rod.id}`
                    )

                    .setLabel(
                        owned
                            ? 'Owned'
                            : rod.name
                    )

                    .setEmoji(
                        owned
                            ? '✅'
                            : '🛒'
                    )

                    .setStyle(

                        owned

                            ? ButtonStyle.Success

                            : ButtonStyle.Primary
                    )

                    .setDisabled(
                        !!owned
                    )
            );

            buttonCount++;

            //
            // NEW ROW
            //

            if (buttonCount === 5) {

                rows.push(currentRow);

                currentRow =
                    new ActionRowBuilder();

                buttonCount = 0;
            }
        }

        //
        // PUSH LAST ROW
        //

        if (buttonCount > 0) {

            rows.push(currentRow);
        }

        //
        // SEND
        //

        const shopMessage =
            await message.reply({

                embeds: [embed],

                components: rows
            });

        //
        // COLLECTOR
        //

        const collector =
            shopMessage.createMessageComponentCollector({

                time: 60000
            });

        collector.on(
            'collect',
            async interaction => {

                //
                // USER CHECK
                //

                if (
                    interaction.user.id !==
                    message.author.id
                ) {

                    return interaction.reply({

                        content:
                            '❌ Đây không phải shop của bạn',

                        ephemeral: true
                    });
                }

                //
                // ROD ID
                //

                const rodId =
                    interaction.customId.replace(
                        'buy_',
                        ''
                    );

                //
                // FIND ROD
                //

                const rod =
                    rods.find(
                        r => r.id === rodId
                    );

                if (!rod) {

                    return interaction.reply({

                        content:
                            '❌ Cần câu không tồn tại',

                        ephemeral: true
                    });
                }

                //
                // REFRESH USER
                //

                user =
                    db.prepare(`
                        SELECT * FROM users
                        WHERE user_id = ?
                    `).get(
                        interaction.user.id
                    );

                //
                // CHECK OWNED
                //

                const ownedRod =
                    db.prepare(`
                        SELECT * FROM user_rods
                        WHERE user_id = ?
                        AND rod_id = ?
                    `).get(
                        interaction.user.id,
                        rod.id
                    );

                if (ownedRod) {

                    return interaction.reply({

                        content:
                            '❌ Bạn đã sở hữu cần này rồi',

                        ephemeral: true
                    });
                }

                //
                // MONEY CHECK
                //

                if (
                    user.money <
                    rod.price
                ) {

                    return interaction.reply({

                        content:

                            `❌ Bạn cần ${rod.price.toLocaleString('vi-VN')}$`,

                        ephemeral: true
                    });
                }

                //
                // REMOVE MONEY
                //

                db.prepare(`
                    UPDATE users
                    SET money = money - ?
                    WHERE user_id = ?
                `).run(
                    rod.price,
                    interaction.user.id
                );

                //
                // ADD ROD
                //

                db.prepare(`
                    INSERT INTO user_rods (
                        user_id,
                        rod_id
                    )
                    VALUES (?, ?)
                `).run(
                    interaction.user.id,
                    rod.id
                );

                //
                // AUTO EQUIP
                //

                db.prepare(`
                    UPDATE users
                    SET rod = ?
                    WHERE user_id = ?
                `).run(
                    rod.id,
                    interaction.user.id
                );

                //
                // SUCCESS
                //

                interaction.reply({

                    content:

                        `🎉 Bạn đã mua **${rod.name}**`,

                    ephemeral: true
                });
            }
        );

        //
        // DISABLE BUTTONS
        //

        collector.on(
            'end',
            async () => {

                const disabledRows = [];

                for (const row of rows) {

                    const disabledRow =
                        new ActionRowBuilder();

                    for (const button of row.components) {

                        disabledRow.addComponents(

                            ButtonBuilder.from(button)

                                .setDisabled(true)
                        );
                    }

                    disabledRows.push(disabledRow);
                }

                shopMessage.edit({

                    components: disabledRows

                }).catch(() => {});
            }
        );
    }
};