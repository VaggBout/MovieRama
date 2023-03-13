import { Request, Response } from "express";
import { VoteDto } from "../../types/dto";
import * as VoteService from "../../services/vote";
import { User } from "../../models/user";

export async function post(req: Request, res: Response): Promise<void> {
    const user: User = res.locals.user;

    const voteDto: VoteDto = {
        movieId: req.body.movieId,
        userId: user.id,
        like: req.body.like,
    };

    try {
        const result = await VoteService.create(voteDto);

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

export async function remove(req: Request, res: Response) {
    const user: User = res.locals.user;

    try {
        const result = await VoteService.removeVote(user.id, +req.params.id);
        if (result.error) {
            res.statusCode = 400;
            res.send({ error: result.error });
            return;
        }

        res.send();
    } catch (error) {
        res.statusCode = 500;
        res.send({ error: "Something went wrong!" });
    }
}
