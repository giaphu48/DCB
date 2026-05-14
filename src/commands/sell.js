// src/commands/sell.js

const db = require('../database/fishing');

const fishes = require('../data/fishes.json');
const { category } = require('./fish');

module.exports = {

    name: 'sell',

    category: 'fish',

    description:
        'Bán tất cả cá trong inventory để lấy tiền',

    async execute(message) {

        const userId = message.author.id;

        // GET INVENTORY

        const inventory = db.prepare(`
            SELECT * FROM inventory
            WHERE user_id = ?
        `).all(userId);

        // EMPTY INVENTORY

        if (!inventory.length) {

            return message.reply(
                '❌ Bạn không có cá để bán'
            );
        }

        let total = 0;

        let soldCount = 0;

        let skipped = 0;

        // CALCULATE MONEY

        for (const item of inventory) {

            const fishData = fishes.find(
                f => f.id === item.fish_id
            );

            // INVALID FISH

            if (!fishData) {

                console.log(
                    `[WARNING] Invalid fish_id: ${item.fish_id}`
                );

                skipped++;

                continue;
            }

            let value = fishData.value;

            // SHINY BONUS

            if (item.shiny) {
                value *= 10;
            }

            total += value * item.amount;

            soldCount += item.amount;
        }

        // NO VALID FISH

        if (total <= 0) {

            return message.reply(
                '❌ Không có cá hợp lệ để bán'
            );
        }

        // UPDATE USER MONEY

        db.prepare(`
            UPDATE users
            SET money = money + ?
            WHERE user_id = ?
        `).run(
            total,
            userId
        );

        // DELETE INVENTORY

        db.prepare(`
            DELETE FROM inventory
            WHERE user_id = ?
        `).run(userId);

        // GET USER MONEY

        const user = db.prepare(`
            SELECT * FROM users
            WHERE user_id = ?
        `).get(userId);

        // MESSAGE

        let result =

            `💰 ${message.author} đã bán cá\n\n` +

            `🐟 Số lượng: ${soldCount}\n` +

            `💵 Nhận được: ${total}$\n` +

            `🏦 Tổng tiền: ${user.money}$`;

        // WARNING

        if (skipped > 0) {

            result +=

                `\n\n⚠️ Bỏ qua ${skipped} cá lỗi`;
        }

        message.reply(result);
    }
};