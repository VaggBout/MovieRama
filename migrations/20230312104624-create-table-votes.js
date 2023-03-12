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
        CREATE TABLE votes (
            user_id INTEGER NOT NULL,
            movie_id INTEGER NOT NULL,
            "like" BOOLEAN NOT NULL,
            CONSTRAINT fk_users_votes
                FOREIGN KEY (user_id)
                REFERENCES users (id),
            CONSTRAINT fk_movies_votes
                FOREIGN KEY (movie_id)
                REFERENCES movies (id)
        );`
        )
        .catch((err) => console.log(err));
};

exports.down = async function (db) {
    await db
        .runSql(
            `
        ALTER TABLE votes
            DROP CONSTRAINT fk_users_votes;
        `
        )
        .then(() =>
            db.runSql(`
            ALTER TABLE votes
                DROP CONSTRAINT fk_movies_votes;
            `)
        )
        .then(() => db.dropTable("votes"))
        .catch((err) => console.log(err));
};
exports._meta = {
    version: 1,
};
