import logger from "../utils/logger";
import { getDb } from "./adapter/postgresAdapter";
import { UserDto } from "../types/dto";

export class User {
    id: number;
    email: string;
    name: string;
    hash: string;

    constructor(id: number, email: string, name: string, hash: string) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.hash = hash;
    }

    public static async create(data: UserDto): Promise<User | null> {
        const query = `
            INSERT INTO users
            (email, name, hash)
            VALUES($1, $2, $3)
            RETURNING id;
        `;

        const params = [data.email, data.name, data.hash];
        try {
            const result = await getDb().query(query, params);
            if ((result.rowCount = 0)) {
                return null;
            }

            return new User(
                result.rows[0].id as number,
                data.email,
                data.name,
                data.hash
            );
        } catch (error) {
            logger.error(`Failed to create new user entry. Error: ${error}`);
            throw new Error("Failed to create new user entry");
        }
    }

    public static async findByEmail(email: string): Promise<User | null> {
        const query = `
            SELECT email, name, hash, id
            FROM users
            WHERE email = $1
            LIMIT 1;
        `;

        const params = [email];

        try {
            const result = await getDb().query(query, params);
            if (result.rowCount === 0) {
                return null;
            }

            const rawUser = result.rows[0] as User;
            return new User(
                rawUser.id,
                rawUser.email,
                rawUser.name,
                rawUser.hash
            );
        } catch (error) {
            logger.error(`Failed to search user entry. Error: ${error}`);
            throw new Error("Failed to search user entry");
        }
    }

    public static async findById(id: number): Promise<User | null> {
        const query = `
            SELECT email, name, hash, id
            FROM users
            WHERE id = $1
            LIMIT 1;
        `;

        const params = [id];

        try {
            const result = await getDb().query(query, params);
            if (result.rowCount === 0) {
                return null;
            }

            const rawUser = result.rows[0] as User;
            return new User(
                rawUser.id,
                rawUser.email,
                rawUser.name,
                rawUser.hash
            );
        } catch (error) {
            logger.error(`Failed to search user entry. Error: ${error}`);
            throw new Error("Failed to search user entry");
        }
    }
}
