// src/commands/coinflip.js

const db =
    require('../database/fishing');



//
// COOLDOWN MESSAGES
//

const cooldownMessages =
    new Set();

module.exports = {

    name: 'coinflip',

    aliases: ['cf'],

    category: 'economy',

    description:
        'Tung đồng xu',

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
                INSERT INTO users (
                    user_id
                )
                VALUES (?)
            `).run(userId);

            user = db.prepare(`
                SELECT * FROM users
                WHERE user_id = ?
            `).get(userId);
        }

        //
        // COOLDOWN
        //

        const cooldown =
            10000;

        const now =
            Date.now();

        const lastGamble =
            user.last_gamble || 0;

        if (
            now - lastGamble <
            cooldown
        ) {

            //
            // ALREADY HAS CD MESSAGE
            //

            if (
                cooldownMessages.has(userId)
            ) {

                return;
            }

            //
            // ADD USER
            //

            cooldownMessages.add(userId);

            //
            // END TIME
            //

            const endTimeMs =

                lastGamble +
                cooldown;

            const endTime = Math.floor(
                endTimeMs / 1000
            );

            //
            // MESSAGE
            //

            const cooldownMessage =
                await message.reply(

                    `⏳ Bạn cần đợi <t:${endTime}:R> để tung xu tiếp`
                );

            //
            // AUTO DELETE
            //

            setTimeout(() => {

                cooldownMessage
                    .delete()
                    .catch(() => { });

                //
                // REMOVE USER
                //

                cooldownMessages.delete(
                    userId
                );

            }, Math.max(
                endTimeMs - now,
                1000
            ));

            return;
        }

        //
        // SIDE
        //

        let side =
            args[0]?.toLowerCase();

        //
        // SHORTCUTS
        //

        if (side === 'n') {

            side = 'ngua';
        }

        if (side === 's') {

            side = 'sap';
        }

        //
        // DISPLAY SIDE
        //

        const displaySide =

            side === 'ngua'

                ? 'NGỬA'

                : 'SẤP';

        //
        // INVALID
        //

        if (

            side !== 'ngua' &&

            side !== 'sap'

        ) {

            return message.reply(

                '❌ Dùng: `!coinflip <ngua|sap|n|s> <amount>`'
            );
        }

        //
        // AMOUNT
        //

        const input =
            args[1];

        if (!input) {

            return message.reply(

                '❌ Vui lòng nhập số tiền muốn cược'
            );
        }

        //
        // ALL
        //

        let amount;

        if (
            input.toLowerCase() === 'all'
        ) {

            amount = Math.min(
                user.money || 0,
                5000
            );

        } else {

            //
            // ONLY NUMBER
            //

            if (
                !/^\d+$/.test(input)
            ) {

                return message.reply(
                    '❌ Số tiền không hợp lệ'
                );
            }

            amount = Number(input);
        }

        //
        // INVALID
        //

        if (

            !Number.isInteger(amount) ||

            amount <= 0

        ) {

            return message.reply(
                '❌ Số tiền không hợp lệ'
            );
        }

        //
        // MAX LIMIT
        //

        if (amount > 5000) {

            return message.reply(
                '❌ Tối đa chỉ được cược 5000$'
            );
        }

        //
        // NOT ENOUGH
        //

        if (
            (user.money || 0) <
            amount
        ) {

            return message.reply(

                `❌ Bạn không đủ ${amount}$`
            );
        }

        //
        // START COOLDOWN
        //

        db.prepare(`
            UPDATE users
            SET last_gamble = ?
            WHERE user_id = ?
        `).run(
            Date.now(),
            userId
        );

        //
        // START MESSAGE
        //

        const gambleMessage =
            await message.reply(
                '🪙 Đang tung đồng xu.'
            );

        //
        // ANIMATION
        //

        setTimeout(() => {

            gambleMessage.edit(

                '🪙 Đang tung đồng xu..'
            ).catch(() => { });

        }, 1000);

        setTimeout(() => {

            gambleMessage.edit(

                '🪙 Đang tung đồng xu...'
            ).catch(() => { });

        }, 2000);

        //
        // RESULT
        //

        setTimeout(async () => {

            try {

                //
                // COIN RESULT
                //

                const result =

                    Math.random() < 0.5

                        ? 'ngua'

                        : 'sap';

                //
                // DISPLAY RESULT
                //

                const displayResult =

                    result === 'ngua'

                        ? 'NGỬA'

                        : 'SẤP';

                //
                // WIN
                //

                const win =
                    side === result;

                //
                // RESULT TEXT
                //

                let resultText = '';

                //
                // WIN
                //

                if (win) {

                    db.prepare(`
                        UPDATE users
                        SET money = money + ?
                        WHERE user_id = ?
                    `).run(
                        amount,
                        userId
                    );

                    resultText =

                        `🎉 ${message.author} đoán đúng!\n\n` +

                        `🪙 Kết quả: ${displayResult}\n` +

                        `💰 +${amount}$`;

                }

                //
                // LOSE
                //

                else {

                    db.prepare(`
                        UPDATE users
                        SET money = money - ?
                        WHERE user_id = ?
                    `).run(
                        amount,
                        userId
                    );

                    resultText =

                        `💀 ${message.author} đoán sai!\n\n` +

                        `🪙 Kết quả: ${displayResult}\n` +

                        `💸 -${amount}$`;
                }

                //
                // REFRESH USER
                //

                user = db.prepare(`
                    SELECT * FROM users
                    WHERE user_id = ?
                `).get(userId);

                //
                // FINAL
                //

                gambleMessage.edit(

                    resultText +

                    `\n\n🪙 Balance: ${user.money}$`

                ).catch(() => { });

            } catch (err) {

                console.error(err);

                gambleMessage.edit(

                    '❌ Có lỗi xảy ra'

                ).catch(() => { });
            }

        }, 3000);
    }
};