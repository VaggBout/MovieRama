import { VoteDto } from "../types/dto";
import logger from "../utils/logger";
import { getDb } from "./adapter/postgresAdapter";

export class Vote {
    movieId: number;
    userId: number;
    like: boolean;

    constructor(movieId: number, userId: number, like: boolean) {
        this.movieId = movieId;
        this.userId = userId;
        this.like = like;
    }

    public static async upsert(data: VoteDto): Promise<Vote | null> {
        const query = `
            INSERT INTO votes
            (movie_id, user_id, "like")
            VALUES($1, $2, $3)
            ON CONFLICT (user_id, movie_id)
                DO UPDATE SET
                    "like" = $3
        `;

        const params = [data.movieId, data.userId, data.like];

        try {
            const result = await getDb().query(query, params);
            if (result.rowCount === 0) {
                return null;
            }

            return new Vote(data.movieId, data.userId, data.like);
        } catch (error) {
            logger.error(`Failed to create vote entry. Error: ${error}`);
            throw new Error("Failed to create vote entry");
        }
    }

    public static async removeByMovieIdUserId(
        userId: number,
        movieId: number
    ): Promise<boolean> {
        const query = `
            DELETE FROM votes
            WHERE user_id = $1
            AND  movie_id = $2;
        `;

        const params = [userId, movieId];

        try {
            const result = await getDb().query(query, params);
            return result.rowCount === 1;
        } catch (error) {
            logger.error(`Failed to remove vote entry. Error: ${error}`);
            throw new Error("Failed to remove vote entry");
        }
    }
}
