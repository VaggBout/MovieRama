import Joi, { ValidationError } from "joi";
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

/**
 * Validate create new movie request
 *
 * In order to create a new movie:
 * * User must be logged in
 * * Request is valid
 */
export async function validateCreateMovieReq(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!res.locals.user) {
        res.statusCode = 401;
        res.send();
        return;
    }

    const movieValidator = Joi.object({
        title: Joi.string().min(3).max(255).required(),
        description: Joi.string().min(6).max(1000).required(),
    });

    const { error } = <
        {
            error: ValidationError;
        }
    >movieValidator.validate(req.body, { errors: { escapeHtml: true } });

    if (error) {
        logger.warn(
            `Invalid create movie body. Error: ${JSON.stringify(error)}`
        );
        res.statusCode = 400;
        res.send({ error: "Invalid body" });
        return;
    }

    next();
}
