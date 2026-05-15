// src/commands/setfish.js

const db =
    require('../database/fishing');

const fishes =
    require('../data/fishes.json');

const trash =
    require('../data/trash.json');

const allItems = [
    ...fishes,
    ...trash
];

module.exports = {

    name: 'setfish',

    category: 'admin',

    description:
        'Set cá/item cho người chơi',

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

                '❌ Dùng: `!setfish <@user> <fish_id> (shiny) (amount)`'
            );
        }

        //
        // FISH ID
        //

        const fishId =
            args[1];

        if (!fishId) {

            return message.reply(
                '❌ Vui lòng nhập fish id'
            );
        }

        //
        // FIND ITEM
        //

        const fish =
            allItems.find(
                f => f.id === fishId
            );

        //
        // INVALID
        //

        if (!fish) {

            return message.reply(
                '❌ Fish ID không tồn tại'
            );
        }

        //
        // SHINY
        //

        let shiny = false;

        //
        // AMOUNT
        //

        let amount = 1;

        //
        // PARSE OPTIONAL
        //

        for (

            let i = 2;

            i < args.length;

            i++

        ) {

            const arg =
                args[i].toLowerCase();

            //
            // SHINY
            //

            if (
                arg === 'shiny'
            ) {

                shiny = true;
            }

            //
            // AMOUNT
            //

            else if (
                /^\d+$/.test(arg)
            ) {

                amount = Number(arg);
            }
        }

        //
        // INVALID AMOUNT
        //

        if (
            amount <= 0
        ) {

            amount = 1;
        }

        //
        // CHECK INVENTORY
        //

        const existing =
            db.prepare(`
                SELECT *
                FROM inventory
                WHERE user_id = ?
                AND fish_id = ?
                AND shiny = ?
            `).get(
                target.id,
                fish.id,
                shiny ? 1 : 0
            );

        //
        // WORTH
        //

        const worth =

            shiny

                ? (fish.value || fish.worth || 0) * 10

                : (fish.value || fish.worth || 0);

        //
        // UPDATE
        //

        if (existing) {

            db.prepare(`
                UPDATE inventory
                SET amount = amount + ?
                WHERE id = ?
            `).run(
                amount,
                existing.id
            );

        }

        //
        // INSERT
        //

        else {

            db.prepare(`
                INSERT INTO inventory (
                    user_id,
                    fish_id,
                    fish_name,
                    rarity,
                    size,
                    worth,
                    shiny,
                    amount
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                target.id,
                fish.id,
                fish.name,
                fish.rarity || 'Trash',
                fish.maxSize || 0,
                worth,
                shiny ? 1 : 0,
                amount
            );
        }

        //
        // DISPLAY
        //

        const shinyText =

            shiny

                ? '✨ '

                : '';

        //
        // MESSAGE
        //

        return message.reply(

            `✅ Đã set ${shinyText}**${fish.name}** x${amount} cho ${target}`
        );
    }
};