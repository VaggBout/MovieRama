import { Request, Response } from "express";
import * as MovieService from "../services/movie";

export async function get(_req: Request, res: Response): Promise<void> {
    try {
        const result = await MovieService.getMoviesPage();
        res.locals.movies = result.data ? result.data : [];
        return res.render("homepage");
    } catch (error) {
        res.statusCode = 500;
        res.render("500");
    }
}
