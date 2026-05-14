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

//
// ACTIVE FISHING
//

const activeFishing = new Set();

module.exports = {

    name: 'fish',

    aliases: ['f'],

    description:
        'Câu cá tại biome',

    category: 'fish',

    async execute(message, args) {

        const userId = message.author.id;

        //
        // ALREADY FISHING
        //

        if (activeFishing.has(userId)) {

            return message.reply(
                '🎣 Bạn đang câu cá rồi!'
            );
        }

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
        // BIOME LEVELS
        //

        const biomeLevels = {

            river: 1,

            lake: 1,

            ocean: 5,

            swamp: 10,

            lava: 15,

            deep_ocean: 20,

            void: 25,

            sky: 30
        };

        //
        // BIOME
        //

        let biome = args[0];

        //
        // RANDOM BIOME
        //

        if (!biome) {

            const unlockedBiomes =
                Object.keys(
                    biomeLevels
                ).filter(

                    biomeName =>

                        user.level >=
                        biomeLevels[biomeName]
                );

            biome = unlockedBiomes[
                Math.floor(
                    Math.random() *
                    unlockedBiomes.length
                )
            ];
        }

        //
        // INVALID BIOME
        //

        if (!biomeLevels[biome]) {

            return message.reply(
                '❌ Biome không tồn tại'
            );
        }

        //
        // LEVEL CHECK
        //

        const requiredLevel =
            biomeLevels[biome];

        if (
            user.level < requiredLevel
        ) {

            return message.reply(

                `❌ Bạn cần level **${requiredLevel}** để câu ở biome **${biome}**`

            );
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

            let left = Math.ceil(

                (
                    cooldown -
                    (now - user.last_fish)
                ) / 1000
            );

            const cooldownMessage =
                await message.reply(

                    `⏳ Hãy đợi ${left}s`
                );

            const interval =
                setInterval(async () => {

                    left--;

                    //
                    // END TIMER
                    //

                    if (left <= 0) {

                        clearInterval(interval);

                        return cooldownMessage
                            .delete()
                            .catch(() => {});
                    }

                    //
                    // PROGRESS BAR
                    //

                    const total =
                        Math.ceil(
                            cooldown / 1000
                        );

                    const progress =

                        '🟩'.repeat(
                            total - left
                        ) +

                        '⬛'.repeat(left);

                    //
                    // UPDATE
                    //

                    cooldownMessage.edit(

                        `⏳ Hãy đợi ${left}s\n\n${progress}`

                    ).catch(() => {});

                }, 1000);

            return;
        }

        //
        // LOCK USER
        //

        activeFishing.add(userId);

        //
        // START MESSAGE
        //

        const fishingMessage =
            await message.reply(
                '🎣 Đang thả câu.'
            );

        //
        // ANIMATION
        //

        setTimeout(() => {

            fishingMessage.edit(
                '🎣 Đang thả câu..'
            ).catch(() => {});

        }, 1000);

        setTimeout(() => {

            fishingMessage.edit(
                '🎣 Đang thả câu...'
            ).catch(() => {});

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

                    return fishingMessage.edit(

                        `🗑️ ${message.author} câu được **${fish.name}**\n\n` +

                        `💵 Worth: ${fish.value}$`

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
                            shiny,
                            amount
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        userId,
                        fish.id,
                        fish.name,
                        fish.rarity,
                        fish.size,
                        fish.shiny ? 1 : 0,
                        1
                    );
                }

                //
                // XP
                //

                let gainedXP = 10;

                if (
                    fish.rarity === 'Rare'
                ) {
                    gainedXP += 5;
                }

                if (
                    fish.rarity === 'Epic'
                ) {
                    gainedXP += 15;
                }

                if (
                    fish.rarity === 'Legendary'
                ) {
                    gainedXP += 40;
                }

                if (
                    fish.rarity === 'Mythic'
                ) {
                    gainedXP += 100;
                }

                //
                // UPDATE USER
                //

                db.prepare(`
                    UPDATE users
                    SET
                        xp = xp + ?,
                        last_fish = ?
                    WHERE user_id = ?
                `).run(
                    gainedXP,
                    Date.now(),
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

                    `🌊 Biome: ${biome}\n\n` +

                    `🏆 Level: ${user.level}\n` +

                    `⭐ XP: ${user.xp}/${nextXP}\n\n` +

                    `${xpBar}`

                ).catch(() => {});

            } catch (err) {

                console.error(err);

                fishingMessage.edit(
                    '❌ Có lỗi xảy ra khi câu cá'
                ).catch(() => {});

            } finally {

                //
                // UNLOCK USER
                //

                activeFishing.delete(userId);
            }

        }, delay);
    }
};