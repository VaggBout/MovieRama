import Joi, { ValidationError } from "joi";
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export function validateRegisterReq(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const validator = Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
        password: Joi.string().min(6).max(25).required(),
        name: Joi.string().min(2).max(50).required().not(null),
    });

    const { error } = <
        {
            error: ValidationError;
        }
    >validator.validate(req.body);

    if (error) {
        logger.warn(`Invalid new user body. Error: ${JSON.stringify(error)}`);
        res.statusCode = 400;
        res.send({ error: "Invalid body" });
        return;
    }

    next();
}
