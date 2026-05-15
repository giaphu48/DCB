// src/utils/fishingEngine.js

const fishes = require('../data/fishes.json');

const rods = require('../data/rods.json');

const trashItems = require('../data/trash.json');

//
// RANDOM
//

function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

//
// GET ROD
//

function getRod(rodId) {

    const rod = rods.find(
        r => r.id === rodId
    );

    return rod || rods[0];
}

//
// RANDOM TRASH
//

function randomTrash() {

    return trashItems[
        Math.floor(
            Math.random() *
            trashItems.length
        )
    ];
}

//
// GENERATE FISH
//

function generateFish(
    user,
    biome = 'river'
) {

    const rod = getRod(
        user.rod || 'wooden_rod'
    );

    //
    // FAIL / TRASH SYSTEM
    //

    let failChance = 10;

    let trashChance = 20;

    // ROD BONUS

    if (rod.id === 'iron_rod') {

        failChance -= 2;
    }

    if (rod.id === 'diamond_rod') {

        failChance -= 5;

        trashChance -= 5;
    }

    const roll = Math.random() * 100;

    //
    // FAIL
    //

    if (roll <= failChance) {

        return {
            type: 'fail'
        };
    }

    //
    // TRASH
    //

    if (
        roll <=
        failChance + trashChance
    ) {

        const trash = randomTrash();

        return {
            type: 'trash',
            ...trash
        };
    }

    //
    // NORMAL FISH
    //

    const availableFish = fishes.filter(

        f =>

            f.biomes.includes(biome) &&

            (
                !f.requiredLevel ||

                user.level >= f.requiredLevel
            )
    );

    //
    // INVALID BIOME
    //

    if (!availableFish.length) {

        return null;
    }

    //
    // MODIFY CHANCES
    //

    const modified = availableFish.map(fish => {

        let chance = fish.baseChance;

        //
        // ROD BONUS
        //

        if (
            fish.rarity !== 'Common'
        ) {

            chance += rod.rareBonus;
        }

        //
        // COMBO BONUS
        //

        chance += (
            user.combo_count || 0
        );

        return {
            ...fish,
            finalChance: chance
        };
    });

    //
    // TOTAL WEIGHT
    //

    const totalChance = modified.reduce(

        (acc, fish) =>

            acc + fish.finalChance,

        0
    );

    //
    // REAL CATCH CHANCE
    //

    let catchChance = 75;

    //
    // ROD BONUS
    //

    catchChance += (
        rod.catchBonus || 0
    );

    //
    // COMBO BONUS
    //

    catchChance += Math.min(
        user.combo_count || 0,
        15
    );

    //
    // LIMIT
    //

    catchChance = Math.min(
        catchChance,
        95
    );

    //
    // INVALID
    //

    if (totalChance <= 0) {

        return null;
    }

    //
    // ABSOLUTE CATCH ROLL
    //

    const catchRoll =
        Math.random() * 100;

    console.log('\n========== FISH DEBUG ==========');

    console.log(
        `👤 User: ${user.user_id || 'unknown'}`
    );

    console.log(
        `🌊 Biome: ${biome}`
    );

    console.log(
        `🪝 Rod: ${rod.name}`
    );

    console.log(
        `🎯 Catch Chance: ${catchChance.toFixed(2)}%`
    );

    console.log(
        `💨 Fail Chance: ${(100 - catchChance).toFixed(2)}%`
    );

    console.log(
        `🗑️ Trash Chance: ${trashChance}%`
    );

    console.log(
        `✨ Shiny Chance: ${(
            (
                0.01 +
                (rod.shinyBonus || 0) / 100
            ) * 100
        ).toFixed(2)}%`
    );

    console.log('\n🐟 Fish Chances:');

    for (const fish of modified) {

        const fishChance =
            fish.finalChance;

        console.log(

            `- ${fish.name}: ${fishChance.toFixed(4)}%`

        );
    }

    console.log('================================\n');

    //
    // FAIL
    //

    if (catchRoll > catchChance) {

        return {
            type: 'fail'
        };
    }

    //
    // TRUE PERCENT SYSTEM
    //

    const passedFish = [];

    for (const fish of modified) {

        const fishRoll =
            Math.random() * 100;

        if (
            fishRoll <= fish.finalChance
        ) {

            passedFish.push(fish);
        }
    }

    //
    // NO FISH PASSED
    //

    if (!passedFish.length) {

        return {
            type: 'fail'
        };
    }

    //
    // SORT BY RARITY
    //

    passedFish.sort(

        (a, b) =>

            b.finalChance -
            a.finalChance
    );

    //
    // PICK RAREST
    //

    const selected =
        passedFish[
        passedFish.length - 1
        ];


    //
    // SIZE
    //

    const size = random(
        selected.minSize,
        selected.maxSize
    );

    //
    // SIZE MULTIPLIER
    //

    const sizeMultiplier =
        size / selected.maxSize;

    //
    // SHINY
    //

    const shiny =
        Math.random() < 0.01;

    //
    // WORTH
    //

    let worth = Math.floor(

        selected.value *

        (0.5 + sizeMultiplier)
    );

    //
    // SHINY BONUS
    //

    if (shiny) {

        worth *= 10;
    }

    //
    // XP
    //

    const xp = Math.floor(

        selected.xp *

        (0.5 + sizeMultiplier)
    );

    //
    // RETURN
    //

    return {

        type: 'fish',

        ...selected,

        size,

        shiny,

        worth,

        xp
    };
}

//
// EXPORTS
//

module.exports = {

    generateFish,

    getRod
};