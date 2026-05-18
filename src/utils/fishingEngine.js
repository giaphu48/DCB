// src/utils/fishingEngine.js

const fishes = require('../data/fishes.json');
const rods = require('../data/rods.json');
const trashItems = require('../data/trash.json');

//
// RANDOM INTEGER
//

function random(min, max) {

    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

//
// RANDOM FLOAT
//

function randomFloat(min, max) {

    return Math.random() * (max - min) + min;
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
// GENERATE SIZE
// Slight bias toward medium sizes
//

function generateSize(min, max) {

    const r =
        (
            Math.random() +
            Math.random()
        ) / 2;

    return Math.floor(
        min + (max - min) * r
    );
}

//
// GENERATE FISH
//

function generateFish(
    user,
    biome = 'river'
) {

    //
    // LOAD ROD
    //

    const rod = getRod(
        user.rod || 'wooden_rod'
    );

    //
    // BASE FAIL/TRASH
    //

    let failChance = 25;
    let trashChance = 20;

    //
    // ROD REDUCTIONS
    //

    failChance -= (
        rod.failReduce || 0
    );

    trashChance -= (
        rod.trashReduce || 0
    );

    //
    // SAFETY
    //

    failChance = Math.max(
        0,
        failChance
    );

    trashChance = Math.max(
        0,
        trashChance
    );

    //
    // INITIAL ROLL
    //

    const initialRoll =
        Math.random() * 100;

    //
    // REAL SUCCESS RATE
    //

    const realCatchRate =
        100 -
        failChance -
        trashChance;

    //
    // DEBUG HEADER
    //

    console.log(
        '\n========== FISH DEBUG =========='
    );

    console.log(
        `👤 User: ${
            user.user_id ||
            'unknown'
        }`
    );

    console.log(
        `🌊 Biome: ${biome}`
    );

    console.log(
        `🪝 Rod: ${rod.name}`
    );

    console.log(
        `🎲 Initial Roll: ${initialRoll.toFixed(2)}`
    );

    console.log(
        `❌ Fail Chance: ${failChance.toFixed(2)}%`
    );

    console.log(
        `🗑️ Trash Chance: ${trashChance.toFixed(2)}%`
    );

    console.log(
        `🐟 Fish Chance: ${realCatchRate.toFixed(2)}%`
    );

    //
    // FAIL
    //

    if (
        initialRoll <= failChance
    ) {

        console.log(
            `📛 RESULT: FAIL`
        );

        console.log(
            '================================\n'
        );

        return {
            type: 'fail'
        };
    }

    //
    // TRASH
    //

    if (
        initialRoll <=
        failChance + trashChance
    ) {

        const trash =
            randomTrash();

        console.log(
            `🗑️ RESULT: TRASH (${trash.name})`
        );

        console.log(
            '================================\n'
        );

        return {
            type: 'trash',
            ...trash
        };
    }

    //
    // FILTER FISH
    //

    const availableFish =
        fishes.filter(fish =>

            //
            // BIOME
            //

            fish.biomes.includes(
                biome
            ) &&

            //
            // LEVEL
            //

            (
                !fish.requiredLevel ||

                user.level >=
                fish.requiredLevel
            )
        );

    //
    // NO FISH
    //

    if (
        !availableFish.length
    ) {

        console.log(
            `❌ No fish available`
        );

        console.log(
            '================================\n'
        );

        return null;
    }

    //
    // BUILD WEIGHTS
    //

    const modified =
        availableFish.map(fish => {

            //
            // BASE WEIGHT
            //

            let weight =
                fish.baseChance;

            //
            // RARE BONUS
            //

            if (
                fish.rarity !==
                'Common'
            ) {

                weight *= (
                    1 +
                    (
                        rod.rareBonus ||
                        0
                    )
                );
            }

            //
            // SAFETY
            //

            weight = Math.max(
                0.0001,
                weight
            );

            return {

                ...fish,

                weight
            };
        });

    //
    // TOTAL WEIGHT
    //

    const totalWeight =
        modified.reduce(

            (sum, fish) =>

                sum +
                fish.weight,

            0
        );

    //
    // INVALID
    //

    if (
        totalWeight <= 0
    ) {

        console.log(
            `❌ Invalid total fish weight`
        );

        console.log(
            '================================\n'
        );

        return null;
    }

    //
    // DEBUG FISH RATES
    //

    console.log(
        '\n🐟 Fish Rates:'
    );

    for (const fish of modified) {

        //
        // POOL RATE
        //

        const poolPercent = (
            fish.weight /
            totalWeight
        ) * 100;

        //
        // REAL RATE
        //

        const realPercent =
            (
                realCatchRate / 100
            ) *
            (
                fish.weight /
                totalWeight
            ) * 100;

        //
        // SHINY RATE
        //

        const shinyChance =
            Math.min(
                0.05,
                0.01 +
                (
                    rod.shinyBonus || 0
                )
            );

        const shinyPercent =
            realPercent *
            shinyChance;

        console.log(

            `- ${fish.name} `
            + `[${fish.rarity}] `
            + `POOL=${poolPercent.toFixed(4)}% `
            + `REAL=${realPercent.toFixed(4)}% `
            + `SHINY=${shinyPercent.toFixed(4)}%`
        );
    }

    //
    // WEIGHTED RANDOM
    //

    let roll =
        Math.random() *
        totalWeight;

    let selected = null;

    for (const fish of modified) {

        roll -= fish.weight;

        if (roll <= 0) {

            selected = fish;
            break;
        }
    }

    //
    // FALLBACK
    //

    if (!selected) {

        selected =
            modified[
                modified.length - 1
            ];
    }

    //
    // SIZE
    //

    const size =
        generateSize(

            selected.minSize,

            selected.maxSize
        );

    //
    // SIZE MULTIPLIER
    //

    const sizeMultiplier =
        size /
        selected.maxSize;

    //
    // SHINY
    //

    const shinyChance =
        Math.min(

            0.05,

            0.01 +
            (
                rod.shinyBonus || 0
            )
        );

    const shiny =
        Math.random() <
        shinyChance;

    //
    // WORTH
    //

    let worth = Math.floor(

        selected.value *

        (
            0.5 +
            sizeMultiplier
        )
    );

    //
    // SHINY BONUS
    //

    if (shiny) {

        worth *= 10;
    }

    //
    // MARKET VARIANCE
    //

    const marketMultiplier =
        randomFloat(
            0.9,
            1.1
        );

    worth = Math.floor(
        worth *
        marketMultiplier
    );

    //
    // XP
    //

    let xp = Math.floor(

        selected.xp *

        (
            0.5 +
            sizeMultiplier
        )
    );

    //
    // RARITY XP BONUS
    //

    const rarityXpBonus = {

        Common: 1,
        Uncommon: 1.2,
        Rare: 1.5,
        Epic: 2,
        Legendary: 3
    };

    xp = Math.floor(

        xp *

        (
            rarityXpBonus[
                selected.rarity
            ] || 1
        )
    );

    //
    // FINAL RESULT DEBUG
    //

    console.log(
        '\n🎣 FINAL RESULT'
    );

    console.log(
        `🐟 Fish: ${selected.name}`
    );

    console.log(
        `⭐ Rarity: ${selected.rarity}`
    );

    console.log(
        `📏 Size: ${size}`
    );

    console.log(
        `✨ Shiny: ${shiny ? 'YES' : 'NO'}`
    );

    console.log(
        `💰 Worth: ${worth}`
    );

    console.log(
        `🧪 XP: ${xp}`
    );

    console.log(
        '================================\n'
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