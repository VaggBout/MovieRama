import { Request, Response } from "express";
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

export async function getRegister(req: Request, res: Response): Promise<void> {
    res.render("register", {});
}
