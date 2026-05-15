// src/commands/resetdata.js

const db =
    require('../database/fishing');

module.exports = {

    name: 'reset',

    aliases: ['rs'],

    description:
        'Xóa dữ liệu fishing',

    category: 'admin',

    async execute(message) {

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

        //
        // RESET USER
        //

        if (target) {

            //
            // USERS
            //

            db.prepare(`
                DELETE FROM users
                WHERE user_id = ?
            `).run(target.id);

            //
            // INVENTORY
            //

            db.prepare(`
                DELETE FROM inventory
                WHERE user_id = ?
            `).run(target.id);

            //
            // USER RODS
            //

            db.prepare(`
                DELETE FROM user_rods
                WHERE user_id = ?
            `).run(target.id);

            return message.reply(

                `🗑️ Đã xóa toàn bộ dữ liệu của ${target}`

            );
        }

        //
        // RESET ALL
        //

        db.prepare(`
            DELETE FROM users
        `).run();

        db.prepare(`
            DELETE FROM inventory
        `).run();

        db.prepare(`
            DELETE FROM user_rods
        `).run();

        return message.reply(

            '💥 Đã xóa TOÀN BỘ dữ liệu fishing'

        );
    }
};
