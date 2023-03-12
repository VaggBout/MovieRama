import { CookieOptions, Request, Response } from "express";
import { User } from "../../models/user";
import * as UserService from "../../services/user";

export async function post(req: Request, res: Response): Promise<void> {
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
