import { Request, Response } from "express";
import * as MovieService from "../services/movie";

export async function get(_req: Request, res: Response): Promise<void> {
    try {
        const userId = res.locals.user ? res.locals.user.id : null;
        const result = await MovieService.getMoviesPage("DESC", 5, 0, userId);
        console.log(result);
        res.locals.movies = result.data ? result.data : [];
        return res.render("homepage");
    } catch (error) {
        res.statusCode = 500;
        res.render("500");
    }
}
