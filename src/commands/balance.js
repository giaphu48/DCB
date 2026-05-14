// src/commands/balance.js

const db = require('../database/fishing');
const { category } = require('./fish');

module.exports = {

    name: 'balance',

    aliases: ['bal', 'blc'],

    category: 'economy',

    description:
        'Xem số dư tài khoản của bạn',

    async execute(message) {

        const userId = message.author.id;

        // GET USER

        let user = db.prepare(`
            SELECT * FROM users
            WHERE user_id = ?
        `).get(userId);

        // CREATE USER

        if (!user) {

            db.prepare(`
                INSERT INTO users (user_id)
                VALUES (?)
            `).run(userId);

            user = db.prepare(`
                SELECT * FROM users
                WHERE user_id = ?
            `).get(userId);
        }

        // FORMAT MONEY

        const money = Number(
            user.money || 0
        ).toLocaleString('vi-VN');

        const xp = Number(
            user.xp || 0
        ).toLocaleString('vi-VN');

        const level = user.level || 1;

        // MESSAGE

        message.reply(

            `💰 Thông tin tài khoản của ${message.author}\n\n` +

            `💵 Tiền: ${money}$\n` +

            `⭐ XP: ${xp}\n` +

            `🏆 Level: ${level}`

        );
    }
};