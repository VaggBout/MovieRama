import { CookieOptions, Request, Response } from "express";
import { User } from "../models/user";
import * as UserService from "../services/user";
import { UserDto } from "../types/dto";

export async function register(req: Request, res: Response): Promise<void> {
    const userDto: UserDto = {
        email: req.body.email,
        name: req.body.name,
        hash: req.body.password,
    };
    try {
        const result = await UserService.register(userDto);
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

export function getRegister(_req: Request, res: Response): void {
    if (res.locals.user) {
        return res.redirect("/");
    }

    res.render("register");
}

export async function login(req: Request, res: Response): Promise<void> {
    const email: string = req.body.email;
    const password: string = req.body.password;

    try {
        const authResult = await UserService.auth(email, password);
        if (authResult.error || !authResult.data) {
            res.statusCode = 400;
            res.send({
                error: authResult.error
                    ? authResult.error
                    : "Invalid credentials",
            });
            return;
        }

        const token = UserService.generateAuthToken(authResult.data as User);

        const options: CookieOptions = {
            expires: new Date(Date.now() + 3600000 * 24 * 60),
        };
        res.cookie("token", token, options);
        res.send();
    } catch (error) {
        res.statusCode = 500;
        res.send({ error: "Something went wrong!" });
    }
}

export function getLogin(_req: Request, res: Response) {
    if (res.locals.user) {
        return res.redirect("/");
    }

    res.render("login");
}
