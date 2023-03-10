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
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            hash VARCHAR(255) NOT NULL
        );`
        )
        .catch((err) => console.log(err));
};

exports.down = async function (db) {
    await db.dropTable("users").catch((err) => console.log(err));
};

exports._meta = {
    version: 1,
};
