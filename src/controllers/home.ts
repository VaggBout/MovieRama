import { Request, Response } from "express";
import * as MovieService from "../services/movie";
import { ReqBody, ReqParams, MovieListParams, ResBody } from "../types/common";

export async function get(
    req: Request<ReqParams, ResBody, ReqBody, MovieListParams>,
    res: Response
): Promise<void> {
    try {
        const userId = res.locals.user ? res.locals.user.id : null;

        const order = req.query.order ? req.query.order : "date";
        const sort = req.query.sort ? req.query.sort : "DESC";
        const page = req.query.page ? req.query.page : 0;
        const limit = req.query.limit ? req.query.limit : 5;

        const result = await MovieService.getMoviesList(
            sort,
            limit,
            page * limit,
            order,
            userId,
            null
        );
        res.locals.movies = result.data?.movies ? result.data.movies : [];
        res.locals.moviesLimit = limit;
        res.locals.moviesPage = page;
        res.locals.totalMovies = result.data?.totalMovies
            ? result.data.totalMovies
            : 0;
        return res.render("home");
    } catch (error) {
        res.statusCode = 500;
        res.render("500");
    }
}
