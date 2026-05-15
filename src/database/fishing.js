const Database = require('better-sqlite3');

const db = new Database('database.sqlite');

db.pragma('journal_mode = WAL');

function addColumnIfNotExists(
    table,
    column,
    query
) {

    const columns = db.prepare(`
        PRAGMA table_info(${table})
    `).all();

    const exists = columns.some(
        c => c.name === column
    );

    if (!exists) {

        db.prepare(query).run();

        console.log(
            `[SQLite] Added '${column}' to '${table}'`
        );
    }
}

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    money INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL
)
`).run();

db.prepare(`
    CREATE TABLE IF NOT EXISTS user_rods (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id TEXT NOT NULL,

        rod_id TEXT NOT NULL
    )
`).run();

addColumnIfNotExists(
    'users',
    'rod',
    `
    ALTER TABLE users
    ADD COLUMN rod TEXT DEFAULT 'wooden_rod'
    `
);

addColumnIfNotExists(
    'users',
    'last_fish',
    `
    ALTER TABLE users
    ADD COLUMN last_fish INTEGER DEFAULT 0
    `
);

addColumnIfNotExists(
    'users',
    'last_gamble',
    `
    ALTER TABLE users
ADD COLUMN last_gamble INTEGER DEFAULT 0;
    `
);

addColumnIfNotExists(
    'inventory',
    'fish_id',
    `
    ALTER TABLE inventory
    ADD COLUMN fish_id TEXT DEFAULT ''
    `
);

addColumnIfNotExists(
    'inventory',
    'fish_name',
    `
    ALTER TABLE inventory
    ADD COLUMN fish_name TEXT DEFAULT ''
    `
);

addColumnIfNotExists(
    'inventory',
    'rarity',
    `
    ALTER TABLE inventory
    ADD COLUMN rarity TEXT DEFAULT 'Common'
    `
);

addColumnIfNotExists(
    'inventory',
    'size',
    `
    ALTER TABLE inventory
    ADD COLUMN size INTEGER DEFAULT 0
    `
);

addColumnIfNotExists(
    'inventory',
    'shiny',
    `
    ALTER TABLE inventory
    ADD COLUMN shiny INTEGER DEFAULT 0
    `
);

addColumnIfNotExists(
    'inventory',
    'amount',
    `
    ALTER TABLE inventory
    ADD COLUMN amount INTEGER DEFAULT 1
    `
);

module.exports = db;