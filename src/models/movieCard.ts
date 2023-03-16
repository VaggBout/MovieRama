import { DateTime } from "luxon";
import logger from "../utils/logger";
import { getDb } from "./adapter/postgresAdapter";
import { Movie } from "./movie";

interface MovieCardDto {
    id: number;
    title: string;
    description: string;
    date: DateTime;
    userId: number;
    userName: string;
    likes: number;
    hates: number;
    vote: boolean | null;
}

type Query = { sql: string; params: Array<number> };

export class MovieCard extends Movie {
    userName: string;
    likes: number;
    hates: number;
    vote: boolean | null;
    daysElapsed: string;

    constructor(dto: MovieCardDto) {
        const dateDiff = dto.date.diffNow("days");

        super(dto.id, dto.title, dto.description, dto.userId, dto.date);
        this.userName = dto.userName;
        this.likes = dto.likes;
        this.hates = dto.hates;
        this.vote = dto.vote;
        this.daysElapsed = `${Math.abs(Math.floor(dateDiff.days))} days ago`;
    }

    public static async getMovieCardList(
        sort: "DESC" | "ASC",
        limit: number,
        offset: number,
        order: "date" | "likes" | "hates",
        creatorId: number | null,
        userId: number | null
    ): Promise<Array<MovieCard>> {
        const query = this.buildMovieCardListQuery(
            sort,
            limit,
            offset,
            order,
            creatorId,
            userId
        );

        try {
            const result = await getDb().query(query.sql, query.params);
            if (result.rowCount === 0) {
                return [];
            }

            const rawMovies: Array<any> = result.rows;
            return rawMovies.map((rawMovie) => {
                return new MovieCard({
                    id: rawMovie.id,
                    title: rawMovie.title,
                    description: rawMovie.description,
                    date: DateTime.fromJSDate(rawMovie.date),
                    userId: rawMovie.user_id,
                    userName: rawMovie.name,
                    likes: rawMovie.likes,
                    hates: rawMovie.hates,
                    vote: rawMovie.vote,
                });
            });
        } catch (error) {
            logger.error(`Failed to fetch movies list. Error: ${error}`);
            throw new Error("Failed to fetch movies list");
        }
    }

    private static buildMovieCardListQuery(
        sort: "DESC" | "ASC",
        limit: number,
        offset: number,
        order: "date" | "likes" | "hates",
        creatorId: number | null,
        userId: number | null
    ): Query {
        let sql = userId
            ? `
            SELECT 
                mv.id, 
                mv.title, 
                mv.description, 
                mv.date, 
                mv.user_id,
                u.name,
                COUNT(CASE WHEN v."like" IS TRUE THEN 1 END) AS likes,
                COUNT(CASE WHEN v."like" IS FALSE THEN 1 END) AS hates,
                uv."like" AS vote
            FROM movies mv
            JOIN users u
                ON u.id = mv.user_id
            LEFT JOIN votes v
                ON mv.id = v.movie_id
            LEFT JOIN votes uv
                ON mv.id = uv.movie_id
                AND uv.user_id = $1
            `
            : `
            SELECT 
                mv.id, 
                mv.title, 
                mv.description, 
                mv.date, 
                mv.user_id,
                u.name,
                COUNT(CASE WHEN v."like" IS TRUE THEN 1 END) AS likes,
                COUNT(CASE WHEN v."like" IS FALSE THEN 1 END) AS hates
            FROM movies mv
            JOIN users u
                    ON u.id = mv.user_id
            LEFT JOIN votes v
                    ON mv.id = v.movie_id
            `;

        if (creatorId) {
            sql += `
            WHERE
                mv.user_id = ${userId ? "$2" : "$1"}
            `;
        }

        sql += userId
            ? `
            GROUP BY mv.id, u.name, uv."like"
            ORDER BY "${order}" ${sort}
            LIMIT ${limit}
            OFFSET ${offset};
            `
            : `
            GROUP BY mv.id, u.name
            ORDER BY "${order}" ${sort}
            LIMIT ${limit}
            OFFSET ${offset};
        `;

        const params = [];
        if (userId) {
            params.push(userId);
        }

        if (creatorId) {
            params.push(creatorId);
        }

        return {
            sql,
            params,
        };
    }
}
