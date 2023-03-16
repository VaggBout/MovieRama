import Joi, { ValidationError } from "joi";
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export function validateLoginReq(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const loginValidator = Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
        password: Joi.string().min(6).max(25).required(),
    });

    const { error } = <
        {
            error: ValidationError;
        }
    >loginValidator.validate(req.body, { errors: { escapeHtml: true } });

    if (error) {
        logger.warn(`Invalid login body. Error: ${error.message}`);
        res.statusCode = 400;
        res.send({ error: error.message });
        return;
    }

    next();
}
