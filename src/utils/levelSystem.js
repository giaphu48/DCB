function requiredXP(level) {

    // Công thức XP

    return Math.floor(
        100 * Math.pow(level, 1.5)
    );
}

function checkLevelUp(user) {

    let level = user.level;
    let xp = user.xp;

    let leveledUp = false;

    while (xp >= requiredXP(level)) {

        xp -= requiredXP(level);

        level++;

        leveledUp = true;
    }

    return {
        level,
        xp,
        leveledUp
    };
}

module.exports = {
    requiredXP,
    checkLevelUp
};