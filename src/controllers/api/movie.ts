import { Request, Response } from "express";
import { User } from "../../models/user";
import { MovieDto } from "../../types/dto";
import * as MovieService from "../../services/movie";
import { DateTime } from "luxon";

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
