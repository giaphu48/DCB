// src/commands/rod.js

const db = require('../database/fishing');

const rods = require('../data/rods.json');

const {
    EmbedBuilder
} = require('discord.js');

module.exports = {

    name: 'rod',

    aliases: ['rods', 'gear'],

    category: 'fish',

    description:
        'Xem thông tin cần câu của bạn hoặc trang bị cần câu mới',

    async execute(message, args) {

        const userId =
            message.author.id;

        //
        // GET USER
        //

        let user = db.prepare(`
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
            // DEFAULT WOODEN ROD
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

            user = db.prepare(`
                SELECT * FROM users
                WHERE user_id = ?
            `).get(userId);
        }

        //
        // AUTO FIX OLD USERS
        //

        const hasWoodenRod =
            db.prepare(`
                SELECT * FROM user_rods
                WHERE user_id = ?
                AND rod_id = ?
            `).get(
                userId,
                'wooden_rod'
            );

        if (!hasWoodenRod) {

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
        }

        //
        // EQUIP ROD
        //

        if (args[0]) {

            const rodId =
                args[0].toLowerCase();

            //
            // FIND ROD
            //

            const rod =
                rods.find(
                    r => r.id === rodId
                );

            if (!rod) {

                return message.reply(
                    '❌ Cần câu không tồn tại'
                );
            }

            //
            // CHECK OWNED
            //

            const ownedRod =
                db.prepare(`
                    SELECT * FROM user_rods
                    WHERE user_id = ?
                    AND rod_id = ?
                `).get(
                    userId,
                    rod.id
                );

            //
            // NOT OWNED
            //

            if (!ownedRod) {

                return message.reply(

                    '❌ Bạn chưa sở hữu cần câu này'

                );
            }

            //
            // ALREADY EQUIPPED
            //

            if (user.rod === rod.id) {

                return message.reply(

                    '❌ Bạn đang dùng cần này rồi'

                );
            }

            //
            // EQUIP
            //

            db.prepare(`
                UPDATE users
                SET rod = ?
                WHERE user_id = ?
            `).run(
                rod.id,
                userId
            );

            return message.reply(

                `🎣 Bạn đã trang bị **${rod.name}**`

            );
        }

        //
        // CURRENT ROD
        //

        const currentRod =
            rods.find(
                r => r.id === user.rod
            ) || rods[0];

        //
        // OWNED RODS
        //

        const ownedRods =
            db.prepare(`
                SELECT * FROM user_rods
                WHERE user_id = ?
            `).all(userId);

        //
        // FORMAT RODS
        //

        const ownedRodText =

            ownedRods.map(r => {

                const rodData =
                    rods.find(
                        rod =>
                            rod.id === r.rod_id
                    );

                if (!rodData) {

                    return null;
                }

                //
                // EMOJI
                //

                let emoji = '⚪';

                switch (rodData.id) {

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
                // EQUIPPED
                //

                const equipped =

                    user.rod === rodData.id

                        ? ' ✅'

                        : '';

                return (

                    `${emoji} ${rodData.name}${equipped}`

                );

            })

            .filter(Boolean)

            .join('\n');

        //
        // EMBED
        //

        const embed =
            new EmbedBuilder()

                .setTitle(
                    '🎣 Fishing Rod'
                )

                .setColor('#00b0f4')

                .setDescription(

                    `🪝 Current Rod: **${currentRod.name}**`

                )

                .addFields(

                    {
                        name: '⭐ Rare Bonus',

                        value:
                            `+${currentRod.rareBonus || 0}`,

                        inline: true
                    },

                    {
                        name: '🎯 Catch Bonus',

                        value:
                            `+${currentRod.catchBonus || 0}%`,

                        inline: true
                    },

                    {
                        name: '✨ Shiny Bonus',

                        value:
                            `+${currentRod.shinyBonus || 0}%`,

                        inline: true
                    },

                    {
                        name: '💨 Fail Reduce',

                        value:
                            `-${currentRod.failReduce || 0}%`,

                        inline: true
                    },

                    {
                        name: '🗑️ Trash Reduce',

                        value:
                            `-${currentRod.trashReduce || 0}%`,

                        inline: true
                    },

                    {
                        name: '⏱️ Cooldown',

                        value:
                            `${currentRod.cooldown / 1000}s`,

                        inline: true
                    },

                    {
                        name: '🎒 Owned Rods',

                        value:

                            ownedRodText ||

                            'Không có cần câu'
                    }
                )

                .setFooter({

                    text:
                        'Dùng !rod <id> để đổi cần'
                });

        //
        // SEND
        //

        message.reply({
            embeds: [embed]
        });
    }
};