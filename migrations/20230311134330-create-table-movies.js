"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = async function (db) {
    await db
        .runSql(
            `
        CREATE TABLE movies (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL UNIQUE,
            description TEXT NOT NULL,
            date TIMESTAMP NOT NULL,
            user_id INTEGER,
            CONSTRAINT fk_movies_users
                FOREIGN KEY (user_id)
                REFERENCES users (id)
        );`
        )
        .catch((err) => console.log(err));
};

exports.down = async function (db) {
    await db
        .runSql(
            `
        ALTER TABLE movies
            DROP CONSTRAINT fk_movies_users;
        `
        )
        .then(() => db.dropTable("movies"))
        .catch((err) => console.log(err));
};

exports._meta = {
    version: 1,
};
