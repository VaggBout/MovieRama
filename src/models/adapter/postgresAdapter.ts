import { Pool, QueryResult } from "pg";
import logger from "../../utils/logger";

let _db: PostgresSQLAdapter | null = null;

interface dbConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

class PostgresSQLAdapter {
    private pool: Pool;

    constructor({ host, port, database, user, password }: dbConfig) {
        this.pool = new Pool({
            host,
            port,
            database,
            user,
            password,
        });
    }

    public async query(
        query: string,
        params: unknown[] = []
    ): Promise<QueryResult<any>> {
        return this.pool.query(query, params);
    }

    async _testConnection() {
        try {
            await this.query("SELECT NOW();");
        } catch (error) {
            console.log(error);
            throw new Error(
                `PostgreSQL could not execute dummy query. Error: ${JSON.stringify(
                    error
                )}`
            );
        }
    }
}

/**
 * Initialize DB connection pool
 *
 * This method creates a new pool and tests the connection based
 * on the `process.env` config. In case of failure the process will exit.
 */
export async function init() {
    const config: dbConfig = {
        host: process.env.DB_HOST || "localhost",
        port: (process.env.DB_PORT as unknown as number) || 5432,
        database: process.env.DB_NAME || "",
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
    };

    const db = new PostgresSQLAdapter(config);
    await db._testConnection().catch((error) => {
        logger.error(`Failed to initialize DB connection. Error: ${error}`);
        process.exit(-1);
    });

    _db = db;
}

/**
 * Get a reference to the DB connection pool
 */
export function getDb(): PostgresSQLAdapter {
    if (_db) {
        return _db;
    }

    throw new Error("DB connection is not yet initialized!");
}
