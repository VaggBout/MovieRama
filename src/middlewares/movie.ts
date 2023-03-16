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
export function validateCreateMovieReq(
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
        logger.warn(`Invalid create movie body. Error: ${error.message}`);
        res.statusCode = 400;
        res.send({ error: error.message });
        return;
    }

    next();
}

export function validateApiMoviesReq(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const error = validate(req);
    if (error) {
        logger.warn(`Invalid create movie body. Error: ${error.message}`);
        res.statusCode = 400;
        res.send({ error: "Invalid request" });
        return;
    }

    next();
}

export function validateRenderMoviesReq(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const error = validate(req);
    if (error) {
        logger.warn(`Invalid create movie body. Error: ${error.message}`);
        // In case params are invalid discard them
        req.query = {};
    }

    next();
}

/**
 * Validate a request that will retrieve a movies page
 */
function validate(req: Request): ValidationError | null {
    const validator = Joi.object({
        order: Joi.string().valid("date", "likes", "hates"),
        sort: Joi.string().valid("DESC", "ASC"),
        page: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER),
        limit: Joi.number().min(1).max(10),
        creatorId: Joi.number().min(0).max(Number.MAX_SAFE_INTEGER),
    });

    const { error } = <
        {
            error: ValidationError | null;
        }
    >validator.validate(req.query, { errors: { escapeHtml: true }, allowUnknown: true });

    return error;
}
