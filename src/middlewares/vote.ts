import Joi, { ValidationError } from "joi";
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * Validate create new vote request
 *
 * In order to create a new vote:
 * * User must be logged in
 * * Request is valid
 */
export async function validateCreateVoteReq(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!res.locals.user) {
        res.statusCode = 401;
        res.send();
        return;
    }

    const voteValidator = Joi.object({
        movieId: Joi.number().required(),
        like: Joi.boolean().required(),
    });

    const { error } = <
        {
            error: ValidationError;
        }
    >voteValidator.validate(req.body, { errors: { escapeHtml: true } });

    if (error) {
        logger.warn(
            `Invalid create vote body. Error: ${JSON.stringify(error)}`
        );
        res.statusCode = 400;
        res.send({ error: "Invalid body" });
        return;
    }

    next();
}
