import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/user";
import { User } from "../models/user";
import Joi, { ValidationError } from "joi";
import logger from "../utils/logger";

/**
 * Middleware responsible for populating
 * user object to `res` in case user is already logged in
 */
export async function populateAuthUser(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token: string | null = req.cookies.token;
    if (!token) {
        return next();
    }

    const validatedToken = UserService.validateToken(token);
    if (!validatedToken) {
        return next();
    }

    try {
        const user = await User.findById(validatedToken.id);
        res.locals.user = user;
    } finally {
        return next();
    }
}

export async function validateUserIdParam(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const validator = Joi.object({
        id: Joi.number().min(1).max(Number.MAX_SAFE_INTEGER).required(),
    });

    const { error } = <
        {
            error: ValidationError;
        }
    >validator.validate(req.params, { errors: { escapeHtml: true } });

    if (error) {
        logger.warn(
            `Invalid user id in url params. Error: ${JSON.stringify(error)}`
        );
        return res.redirect("/404");
    }

    next();
}
