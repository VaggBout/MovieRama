import { Request, Response } from "express";
import { User } from "../models/user";
import { MovieDto } from "../types/dto";
import * as MovieService from "../services/movie";

export async function createMovie(req: Request, res: Response): Promise<void> {
    const user: User = res.locals.user;

    const movieDto: MovieDto = {
        title: req.body.title,
        description: req.body.description,
        userId: user.id,
        date: new Date().getTime() / 1000,
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
