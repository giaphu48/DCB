const db = require('../database/fishing');
const { aliases } = require('./balance');

module.exports = {

    name: 'inventory',

    aliases: ['inv', 'bag'],

    category: 'economy',

    description:
        'Xem những con cá bạn đã bắt được',

    async execute(message) {

        const userId = message.author.id;

        const fishes = db.prepare(`
            SELECT * FROM inventory
            WHERE user_id = ?
        `).all(userId);

        if (!fishes.length) {
            return message.reply(
                '🎒 Inventory trống'
            );
        }

        let text = '';

        for (const fish of fishes) {

            const shiny = fish.shiny
                ? '✨ '
                : '';

            text +=
                `${shiny}${fish.fish_name} x${fish.amount} ` +
                `(${fish.rarity})\n`;
        }

        message.reply(
            `🎒 Inventory:\n\n${text}`
        );
    }
};