// src/commands/give.js

const db = require('../database/fishing');
const { category } = require('./fish');

module.exports = {

    name: 'give',

    aliases: ['send'],

    category: 'economy',

    description:
        'Chuyển tiền cho người khác',

    async execute(message, args) {

        const senderId = message.author.id;

        // TARGET

        const target =
            message.mentions.users.first();

        if (!target) {

            return message.reply(
                '❌ Hãy mention người nhận'
            );
        }

        // KHÔNG TỰ GIVE

        if (target.id === senderId) {

            return message.reply(
                '❌ Bạn không thể tự chuyển tiền'
            );
        }

        // BOT CHECK

        if (target.bot) {

            return message.reply(
                '❌ Không thể chuyển tiền cho bot'
            );
        }

        // AMOUNT

        const amount = Number(args[1]);

        if (
            !amount ||
            isNaN(amount) ||
            amount <= 0
        ) {

            return message.reply(
                '❌ Số tiền không hợp lệ'
            );
        }

        // GET SENDER

        let sender = db.prepare(`
            SELECT * FROM users
            WHERE user_id = ?
        `).get(senderId);

        // CREATE SENDER

        if (!sender) {

            db.prepare(`
                INSERT INTO users (user_id)
                VALUES (?)
            `).run(senderId);

            sender = db.prepare(`
                SELECT * FROM users
                WHERE user_id = ?
            `).get(senderId);
        }

        // GET TARGET

        let receiver = db.prepare(`
            SELECT * FROM users
            WHERE user_id = ?
        `).get(target.id);

        // CREATE TARGET

        if (!receiver) {

            db.prepare(`
                INSERT INTO users (user_id)
                VALUES (?)
            `).run(target.id);

            receiver = db.prepare(`
                SELECT * FROM users
                WHERE user_id = ?
            `).get(target.id);
        }

        // MONEY CHECK

        if (sender.money < amount) {

            return message.reply(
                '❌ Bạn không đủ tiền'
            );
        }

        // UPDATE SENDER

        db.prepare(`
            UPDATE users
            SET money = money - ?
            WHERE user_id = ?
        `).run(
            amount,
            senderId
        );

        // UPDATE RECEIVER

        db.prepare(`
            UPDATE users
            SET money = money + ?
            WHERE user_id = ?
        `).run(
            amount,
            target.id
        );

        // FORMAT

        const formatted =
            amount.toLocaleString('vi-VN');

        // MESSAGE

        message.reply(

            `💸 ${message.author} đã chuyển ` +

            `**${formatted}$** cho ${target}`

        );
    }
};