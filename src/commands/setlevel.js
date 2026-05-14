// src/commands/setlevel.js

const db = require('../database/fishing');
const { category } = require('./fish');

module.exports = {

    name: 'setlevel',

    aliases: ['levelset'],

    category: 'admin',

    description:
        'Set level của một người chơi. Chỉ dành cho Administrator.',

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
        // LEVEL
        //

        const level =
            parseInt(args[1]);

        if (
            isNaN(level) ||
            level < 1
        ) {

            return message.reply(
                '❌ Level không hợp lệ'
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
        // UPDATE LEVEL
        //

        db.prepare(`
            UPDATE users
            SET
                level = ?,
                xp = 0
            WHERE user_id = ?
        `).run(
            level,
            target.id
        );

        //
        // MESSAGE
        //

        message.reply(

            `🎉 Đã set level của ${target} thành **${level}**`

        );
    }
};