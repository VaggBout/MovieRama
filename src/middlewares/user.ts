import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/user";
import { User } from "../models/user";

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
