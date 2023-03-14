import cookieParser from "cookie-parser";
import express, { Express } from "express";
import path from "path";
import routes from "../../src/routes";
// import * as dotenv from "dotenv";
import { getDb, init } from "../../src/models/adapter/postgresAdapter";
import { DbConfig } from "../../src/types/db";
import config from "../../src/utils/config";

const dbMigrate = require("db-migrate");

// dotenv.config({ path: path.join(__dirname, "../../integration.env") });

const dbmDefaultConfig = {
    env: "dev",
    config: {
        dev: {
            driver: "pg",
            user: config.dbUser,
            password: config.dbPassword,
            port: config.dbPort,
            host: config.dbHost,
            schema: "public",
            database: "postgres",
        },
    },
};

export function buildMockApp(): Express {
    const mockApp = express();

    mockApp.set("views", path.join(__dirname, "../../src/views"));
    mockApp.set("view engine", "ejs");

    mockApp.use(cookieParser());
    mockApp.use(express.json());
    mockApp.use("/", routes);

    return mockApp;
}

export async function initDbConnection(name: string): Promise<void> {
    const dbName = `movieRama_test_${name}`;

    const dbConfig: DbConfig = {
        host: config.dbHost,
        port: config.dbPort,
        database: dbName,
        user: config.dbUser,
        password: config.dbPassword,
    };

    await init(dbConfig);
}

export async function buildDatabaseAndSchema(name: string) {
    const dbName = `movieRama_test_${name}`;
    const cwd = path.join(__dirname, "../");
    const initialDbm = dbMigrate.getInstance(cwd, dbmDefaultConfig);
    await initialDbm.createDatabase(dbName).catch(() => {
        throw new Error("Failed to create db");
    });

    // We need a new instance to the newly created db
    let dbmConfig = JSON.parse(JSON.stringify(dbmDefaultConfig));
    dbmConfig.config.dev.database = dbName;
    const dbm = dbMigrate.getInstance(cwd, dbmConfig);

    await dbm.up().catch(() => {
        throw new Error("Failed to run migrations");
    });
}

export async function teardownDatabase(name: string) {
    await getDb().close();

    const dbName = `movieRama_test_${name}`;
    const cwd = path.join(__dirname, "../");
    // We cant open a connection to the db we are planning to delete
    // use default instead
    const dbm = dbMigrate.getInstance(cwd, dbmDefaultConfig);
    await dbm.dropDatabase(dbName).catch(() => {
        throw new Error("Failed to drop db");
    });
}

export async function cleanDb() {
    await getDb().query("TRUNCATE movies, votes, users CASCADE;");
    await getDb().query("ALTER SEQUENCE movies_id_seq RESTART;");
    await getDb().query("ALTER SEQUENCE users_id_seq RESTART;");
}
