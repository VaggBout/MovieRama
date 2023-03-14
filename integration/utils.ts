import { getDb } from "../src/models/adapter/postgresAdapter";

export async function cleanDb() {
    await getDb().query("TRUNCATE movies, votes, users CASCADE;");
}
