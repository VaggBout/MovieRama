import { Request, Response } from "express";
import { User } from "../../models/user";
import { MovieDto } from "../../types/dto";
import * as MovieService from "../../services/movie";
import { DateTime } from "luxon";
import {
    MoviesPageParams,
    ReqBody,
    ReqParams,
    ResBody,
} from "../../types/common";
import logger from "../../utils/logger";

export async function post(req: Request, res: Response): Promise<void> {
    const user: User = res.locals.user;

    const movieDto: MovieDto = {
        title: req.body.title,
        description: req.body.description,
        userId: user.id,
        date: DateTime.now(),
    };

    try {
        const result = await MovieService.create(movieDto);
        if (result.error) {
            res.statusCode = 400;
            res.send({ error: result.error });
            return;
        }

        res.send({ data: result.data });
    } catch (error) {
        res.statusCode = 500;
        res.send({ error: "Something went wrong!" });
    }
}

export async function get(
    req: Request<ReqParams, ResBody, ReqBody, MoviesPageParams>,
    res: Response
): Promise<void> {
    try {
        const userId = res.locals.user ? res.locals.user.id : null;

        const order = req.query.order ? req.query.order : "date";
        const sort = req.query.sort ? req.query.sort : "DESC";
        const page = req.query.page ? req.query.page : 0;
        const limit = req.query.limit ? req.query.limit : 5;
        const creatorId = req.query.creatorId ? req.query.creatorId : null;

        const result = await MovieService.getMoviesPage(
            sort,
            limit,
            page * limit,
            order,
            userId,
            creatorId
        );

        const html: string = await new Promise(function (resolve, reject) {
            req.app.render(
                "partials/moviesList",
                {
                    user: res.locals.user,
                    movies: result.data?.movies ? result.data.movies : [],
                },
                function (error: Error, html: string) {
                    if (error) {
                        return reject(error);
                    }
                    resolve(html);
                }
            );
        });

        res.send({
            html,
            data: {
                totalMovies: result.data?.totalMovies
                    ? result.data.totalMovies
                    : 0,
            },
        });
    } catch (error) {
        logger.error(error);
        res.statusCode = 500;
        res.send({ error: "Something went wrong!" });
    }
}
