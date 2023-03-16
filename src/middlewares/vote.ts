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
export function validateCreateVoteReq(
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
        movieId: Joi.number().min(1).max(Number.MAX_SAFE_INTEGER).required(),
        like: Joi.boolean().required(),
    });

    const { error } = <
        {
            error: ValidationError;
        }
    >voteValidator.validate(req.body, { errors: { escapeHtml: true } });

    if (error) {
        logger.warn(`Invalid create vote body. Error: ${error.message}`);
        res.statusCode = 400;
        res.send({ error: error.message });
        return;
    }

    next();
}

/**
 * Validate remove vote request
 *
 * In order to create a new vote:
 * * User must be logged in
 * * Request params contain valid id
 */
export function validateRemoveVoteReq(
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
        movieId: Joi.number().min(1).max(Number.MAX_SAFE_INTEGER).required(),
    });

    const { error } = <
        {
            error: ValidationError;
        }
    >voteValidator.validate(req.query, { errors: { escapeHtml: true } });

    if (error) {
        logger.warn(`Invalid remove vote body. Error: ${error.message}`);
        res.statusCode = 400;
        res.send({ error: error.message });
        return;
    }

    next();
}
