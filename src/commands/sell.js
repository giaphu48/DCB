// src/commands/sell.js

const db =
    require('../database/fishing');

module.exports = {

    name: 'sell',

    category: 'fish',

    description:
        'Bán tất cả item trong inventory',

    async execute(message) {

        const userId =
            message.author.id;

        //
        // GET INVENTORY
        //

        const inventory = db.prepare(`
            SELECT *
            FROM inventory
            WHERE user_id = ?
            AND amount > 0
        `).all(userId);

        //
        // EMPTY INVENTORY
        //

        if (!inventory.length) {

            return message.reply(
                '❌ Bạn không có gì để bán'
            );
        }

        let total = 0;

        let soldCount = 0;

        //
        // CALCULATE
        //

        for (const item of inventory) {

            //
            // ITEM VALUE
            //

            let value =
                item.worth || 0;

            //
            // SAFETY
            //

            if (value < 0) {

                value = 0;
            }

            //
            // TOTAL
            //

            total +=
                value * item.amount;

            soldCount +=
                item.amount;
        }

        //
        // INVALID
        //

        if (total <= 0) {

            return message.reply(
                '❌ Không có item hợp lệ để bán'
            );
        }

        //
        // UPDATE MONEY
        //

        db.prepare(`
            UPDATE users
            SET money = money + ?
            WHERE user_id = ?
        `).run(
            total,
            userId
        );

        //
        // RESET INVENTORY
        //

        db.prepare(`
            UPDATE inventory
            SET amount = 0
            WHERE user_id = ?
        `).run(userId);

        //
        // GET USER
        //

        const user = db.prepare(`
            SELECT *
            FROM users
            WHERE user_id = ?
        `).get(userId);

        //
        // MESSAGE
        //

        return message.reply(

            `💰 ${message.author} đã bán toàn bộ inventory\n\n` +

            `📦 Số lượng item: ${soldCount}\n` +

            `💵 Nhận được: ${total}$\n` +

            `🏦 Tổng tiền: ${user.money}$`
        );
    }
};