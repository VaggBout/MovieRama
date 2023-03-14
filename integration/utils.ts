import { getDb } from "../src/models/adapter/postgresAdapter";

export async function cleanDb() {
    await getDb().query("TRUNCATE movies, votes, users CASCADE;");
    await getDb().query("ALTER SEQUENCE movies_id_seq RESTART;");
    await getDb().query("ALTER SEQUENCE users_id_seq RESTART;");
}
