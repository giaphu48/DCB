// src/commands/setmoney.js

const db = require('../database/fishing');
const { category } = require('./fish');

module.exports = {

    name: 'setmoney',

    aliases: ['moneyset', 'givemoney'],

    category: 'admin',

    description:
        'Set tiền của một người chơi. Chỉ dành cho Administrator.',

    async execute(message, args) {

        //
        // ADMIN CHECK
        //

        if (
            !message.member.permissions.has(
                'Administrator'
            )
        ) {

            return message.reply(
                '❌ Bạn không có quyền dùng lệnh này'
            );
        }

        //
        // TARGET
        //

        const target =
            message.mentions.users.first();

        if (!target) {

            return message.reply(
                '❌ Hãy mention người chơi'
            );
        }

        //
        // MONEY
        //

        const money =
            parseInt(args[1]);

        if (
            isNaN(money) ||
            money < 0
        ) {

            return message.reply(
                '❌ Số tiền không hợp lệ'
            );
        }

        //
        // GET USER
        //

        let user = db.prepare(`
            SELECT * FROM users
            WHERE user_id = ?
        `).get(target.id);

        //
        // CREATE USER
        //

        if (!user) {

            db.prepare(`
                INSERT INTO users (user_id)
                VALUES (?)
            `).run(target.id);

            user = db.prepare(`
                SELECT * FROM users
                WHERE user_id = ?
            `).get(target.id);
        }

        //
        // UPDATE MONEY
        //

        db.prepare(`
            UPDATE users
            SET money = ?
            WHERE user_id = ?
        `).run(
            money,
            target.id
        );

        //
        // MESSAGE
        //

        message.reply(

            `💰 Đã set tiền của ${target} thành ` +

            `**${money.toLocaleString('vi-VN')}$**`

        );
    }
};