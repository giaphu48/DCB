// src/commands/fish.js

const db = require('../database/fishing');

const {
    generateFish,
    getRod
} = require('../utils/fishingEngine');

const {
    checkLevelUp,
    requiredXP
} = require('../utils/levelSystem');

const biomes =
    require('../data/biomes.json');

//
// ACTIVE FISHING
//

const activeFishing = new Set();

//
// COOLDOWN MESSAGES
//

const cooldownMessages =
    new Set();

module.exports = {

    name: 'fish',

    aliases: ['f'],

    description:
        'Câu cá tại biome',

    category: 'fish',

    async execute(message, args) {

        const userId = message.author.id;

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
                INSERT INTO users (user_id)
                VALUES (?)
            `).run(userId);

            //
            // DEFAULT ROD
            //

            db.prepare(`
                INSERT INTO user_rods (
                    user_id,
                    rod_id
                )
                VALUES (?, ?)
            `).run(
                userId,
                'wooden_rod'
            );

            user = db.prepare(`
                SELECT * FROM users
                WHERE user_id = ?
            `).get(userId);
        }

        //
        // GET ROD
        //

        const rod = getRod(
            user.rod || 'wooden_rod'
        );

        //
        // COOLDOWN
        //

        const now = Date.now();

        const cooldown =
            rod.cooldown;

        if (
            now - user.last_fish <
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

                user.last_fish +
                cooldown;

            const endTime = Math.floor(
                endTimeMs / 1000
            );

            //
            // MESSAGE
            //

            const cooldownMessage =
                await message.reply(

                    `⏳ Bạn cần đợi <t:${endTime}:R> để câu tiếp`
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
        // ALREADY FISHING
        //

        if (activeFishing.has(userId)) {

            return;
        }

        //
        // BIOME
        //

        let biome = args[0];

        //
        // RANDOM BIOME
        //

        if (!biome) {

            const unlockedBiomes =
                biomes.filter(

                    biomeData =>

                        user.level >=
                        biomeData.requiredLevel
                );

            biome =
                unlockedBiomes[
                    Math.floor(
                        Math.random() *
                        unlockedBiomes.length
                    )
                ].id;
        }

        //
        // FIND BIOME
        //

        const biomeData =
            biomes.find(
                b => b.id === biome
            );

        //
        // INVALID BIOME
        //

        if (!biomeData) {

            return message.reply(
                '❌ Biome không tồn tại'
            );
        }

        //
        // LEVEL CHECK
        //

        if (
            user.level <
            biomeData.requiredLevel
        ) {

            return message.reply(

                `❌ Bạn cần level **${biomeData.requiredLevel}** để câu ở biome **${biomeData.name}**`

            );
        }

        //
        // LOCK USER
        //

        activeFishing.add(userId);

        //
        // START COOLDOWN NOW
        //

        db.prepare(`
            UPDATE users
            SET last_fish = ?
            WHERE user_id = ?
        `).run(
            Date.now(),
            userId
        );

        //
        // START MESSAGE
        //

        const fishingMessage =
            await message.reply(

                `🎣 Đang thả câu.`

            );

        //
        // ANIMATION
        //

        setTimeout(() => {

            fishingMessage.edit(

                `🎣 Đang thả câu..`

            ).catch(() => { });

        }, 1000);

        setTimeout(() => {

            fishingMessage.edit(

                `🎣 Đang thả câu...`

            ).catch(() => { });

        }, 2000);

        //
        // RANDOM DELAY
        //

        const delay = Math.floor(
            Math.random() * 3000
        ) + 3000;

        //
        // RESULT
        //

        setTimeout(() => {

            try {

                const fish =
                    generateFish(
                        user,
                        biome
                    );

                //
                // INVALID
                //

                if (!fish) {

                    return fishingMessage.edit(

                        '❌ Không có cá ở biome này'

                    );
                }

                //
                // FAIL
                //

                if (
                    fish.type === 'fail'
                ) {

                    return fishingMessage.edit(

                        `💨 ${message.author} kéo cần quá chậm...\n\n` +

                        `🐟 Cá đã chạy mất!`

                    );
                }

                //
                // TRASH
                //

                if (
                    fish.type === 'trash'
                ) {

                    //
                    // CHECK INVENTORY
                    //

                    const existingTrash =
                        db.prepare(`
            SELECT *
            FROM inventory
            WHERE user_id = ?
            AND fish_id = ?
        `).get(
                            userId,
                            fish.id
                        );

                    //
                    // UPDATE INVENTORY
                    //

                    if (existingTrash) {

                        db.prepare(`
            UPDATE inventory
            SET amount = amount + 1
            WHERE id = ?
        `).run(
                            existingTrash.id
                        );

                    } else {

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
                            userId,
                            fish.id,
                            fish.name,
                            'Trash',
                            0,
                            fish.value,
                            0,
                            1
                        );
                    }

                    //
                    // MESSAGE
                    //

                    return fishingMessage.edit(

                        `🗑️ ${message.author} câu được **${fish.name}**\n\n` +

                        `💰 Worth: ${fish.value}$`

                    );
                }

                //
                // CHECK INVENTORY
                //

                const existingFish =
                    db.prepare(`
                        SELECT * FROM inventory
                        WHERE user_id = ?
                        AND fish_id = ?
                        AND shiny = ?
                    `).get(
                        userId,
                        fish.id,
                        fish.shiny ? 1 : 0
                    );

                //
                // UPDATE INVENTORY
                //

                if (existingFish) {

                    db.prepare(`
                        UPDATE inventory
                        SET amount = amount + 1
                        WHERE id = ?
                    `).run(
                        existingFish.id
                    );

                } else {
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
                    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
                        `).run(
                        userId,
                        fish.id,
                        fish.name,
                        fish.rarity,
                        fish.size,
                        fish.worth,
                        fish.shiny ? 1 : 0,
                        1
                    );
                }

                //
                // XP
                //

                const gainedXP =
                    10 + fish.xp;

                //
                // UPDATE USER
                //

                db.prepare(`
                    UPDATE users
                    SET
                        xp = xp + ?
                    WHERE user_id = ?
                `).run(
                    gainedXP,
                    userId
                );

                //
                // REFRESH USER
                //

                user = db.prepare(`
                    SELECT * FROM users
                    WHERE user_id = ?
                `).get(userId);

                //
                // LEVEL CHECK
                //

                const levelData =
                    checkLevelUp(user);

                //
                // LEVEL UP
                //

                if (
                    levelData.leveledUp
                ) {

                    db.prepare(`
                        UPDATE users
                        SET
                            level = ?,
                            xp = ?
                        WHERE user_id = ?
                    `).run(
                        levelData.level,
                        levelData.xp,
                        userId
                    );

                    fishingMessage.channel.send(

                        `🎉 ${message.author} đã lên level **${levelData.level}**!`

                    );

                    //
                    // REFRESH AGAIN
                    //

                    user = db.prepare(`
                        SELECT * FROM users
                        WHERE user_id = ?
                    `).get(userId);
                }

                //
                // XP BAR
                //

                const nextXP =
                    requiredXP(
                        user.level
                    );

                const xpBarCount = 10;

                const filledBars =
                    Math.floor(

                        (
                            user.xp /
                            nextXP
                        ) *

                        xpBarCount
                    );

                const xpBar =

                    '🟩'.repeat(
                        filledBars
                    ) +

                    '⬛'.repeat(
                        xpBarCount -
                        filledBars
                    );

                //
                // SHINY
                //

                const shinyText =

                    fish.shiny

                        ? '✨ SHINY '

                        : '';

                //
                // RARITY EMOJI
                //

                let rarityEmoji = '⚪';

                switch (
                fish.rarity
                ) {

                    case 'Rare':
                        rarityEmoji = '🟦';
                        break;

                    case 'Epic':
                        rarityEmoji = '🟪';
                        break;

                    case 'Legendary':
                        rarityEmoji = '🟨';
                        break;

                    case 'Mythic':
                        rarityEmoji = '🟥';
                        break;
                }

                //
                // FINAL MESSAGE
                //

                fishingMessage.edit(

                    `${shinyText}🐟 ${message.author} đã câu được **${fish.name}**\n\n` +

                    `${rarityEmoji} Rarity: ${fish.rarity}\n` +

                    `📏 Size: ${fish.size}cm\n` +

                    `💰 Worth: ${fish.worth}$\n` +

                    `⭐ XP: +${gainedXP}\n` +

                    `${biomeData.emoji} Biome: ${biomeData.name}\n\n` +

                    `🏆 Level: ${user.level}\n` +

                    `⭐ XP: ${user.xp}/${nextXP}\n\n` +

                    `${xpBar}`

                ).catch(() => { });

            } catch (err) {

                console.error(err);

                fishingMessage.edit(
                    '❌ Có lỗi xảy ra khi câu cá'
                ).catch(() => { });

            } finally {

                //
                // UNLOCK USER
                //

                activeFishing.delete(userId);
            }

        }, delay);
    }
};