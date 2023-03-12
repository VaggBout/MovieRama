import { DateTime } from "luxon";
import { MovieDto, MoviesPageDto } from "../types/dto";
import logger from "../utils/logger";
import { getDb } from "./adapter/postgresAdapter";

export class Movie {
    id: number;
    title: string;
    description: string;
    userId: number;
    date: DateTime;

    constructor(
        id: number,
        title: string,
        description: string,
        userId: number,
        date: DateTime
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.date = date;
    }

    public static async create(data: MovieDto): Promise<Movie | null> {
        const query = `
            INSERT INTO movies
            (title, description, date, user_id)
            VALUES($1, $2, $3, $4)
            RETURNING id;
        `;

        const params = [data.title, data.description, data.date, data.userId];
        try {
            const result = await getDb().query(query, params);
            if (result.rowCount === 0) {
                return null;
            }

            return new Movie(
                result.rows[0] as number,
                data.title,
                data.description,
                data.userId,
                data.date
            );
        } catch (error) {
            logger.error(`Failed to create movie entry. Error: ${error}`);
            throw new Error("Failed to create movie entry");
        }
    }

    public static async findByTitle(title: string): Promise<Movie | null> {
        const query = `
            SELECT id, description, date, user_id
            FROM movies
            WHERE title = $1;
        `;

        const params = [title];
        try {
            const result = await getDb().query(query, params);
            if (result.rowCount === 0) {
                return null;
            }

            const rawMovie: any = result.rows[0];
            return new Movie(
                rawMovie.id,
                title,
                rawMovie.description,
                rawMovie.user_id,
                DateTime.fromJSDate(rawMovie.date)
            );
        } catch (error) {
            logger.error(
                `Failed to search for movie entry by title. Error: ${error}`
            );
            throw new Error("Failed to search for movie entry");
        }
    }

    public static async findById(id: number): Promise<Movie | null> {
        const query = `
            SELECT title, description, date, user_id
            FROM movies
            WHERE id = $1;
        `;

        const params = [id];
        try {
            const result = await getDb().query(query, params);
            if (result.rowCount === 0) {
                return null;
            }

            const rawMovie: any = result.rows[0];
            return new Movie(
                id,
                rawMovie.title,
                rawMovie.description,
                rawMovie.user_id,
                DateTime.fromJSDate(rawMovie.date)
            );
        } catch (error) {
            logger.error(
                `Failed to search for movie entry by title. Error: ${error}`
            );
            throw new Error("Failed to search for movie entry");
        }
    }

    public static async getMoviesPage(
        sort: "DESC" | "ASC",
        limit: number,
        offset: number
    ): Promise<MoviesPageDto> {
        const query = `
            SELECT mv.id, mv.title, mv.description, mv.date, mv.user_id, u.name
            FROM movies mv
            JOIN users u
                ON u.id = mv.user_id
            ORDER BY mv.date ${sort}
            LIMIT ${limit}
            OFFSET ${offset};
        `;

        try {
            const result = await getDb().query(query, []);
            if (result.rowCount === 0) {
                return [];
            }

            const rawMovies: Array<any> = result.rows;
            return rawMovies.map((rawMovie) => {
                const dateDiff = DateTime.fromJSDate(rawMovie.date).diffNow(
                    "days"
                );

                return {
                    id: rawMovie.id,
                    title: rawMovie.title,
                    description: rawMovie.description,
                    daysElapsed: `${Math.abs(
                        Math.floor(dateDiff.days)
                    )} days ago`,
                    userId: rawMovie.user_id,
                    userName: rawMovie.name,
                };
            });
        } catch (error) {
            logger.error(`Failed to fetch movies page. Error: ${error}`);
            throw new Error("Failed to fetch movies page");
        }
    }
}
