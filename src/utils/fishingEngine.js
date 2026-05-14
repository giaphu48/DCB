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
    // TOTAL CHANCE
    //

    const totalChance = modified.reduce(



        (acc, fish) =>

            acc + fish.finalChance,

        0
    );

    //
    // ROD CATCH BONUS
    //

    const boostedChance =

        totalChance +

        (rod.catchBonus || 0);

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
    `🎯 Total Catch Chance: ${boostedChance.toFixed(2)}%`
);

console.log(
    `💨 Fail Chance: ${(100 - boostedChance).toFixed(2)}%`
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

    const fishChance = (
        fish.finalChance /
        totalChance
    ) * boostedChance;

    console.log(

        `- ${fish.name}: ${fishChance.toFixed(4)}%`

    );
}

console.log('================================\n');

    //
    // FAIL
    //

    if (catchRoll > boostedChance) {

        return {
            type: 'fail'
        };
    }

    //
    // WEIGHTED RANDOM
    //

    let rand =
        Math.random() * totalChance;

    let selected = modified[0];

    for (const fish of modified) {

        rand -= fish.finalChance;

        if (rand <= 0) {

            selected = fish;
            break;
        }
    }

    //
    // SIZE
    //

    const size = random(
        selected.minSize,
        selected.maxSize
    );

    //
    // SHINY
    //

    const shiny =
        Math.random() < 0.01;


    //
    // RETURN
    //

    return {

        type: 'fish',

        ...selected,

        size,

        shiny,

        worth: shiny

            ? selected.value * 10

            : selected.value
    };
}

//
// EXPORTS
//

module.exports = {

    generateFish,

    getRod
};