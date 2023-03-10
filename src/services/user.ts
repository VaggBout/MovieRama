import { User } from "../models/user";
import { OperationResult } from "../types/generic";
import * as bcrypt from "bcrypt";
import { UserDto } from "../types/dto";

const saltRounds = 10;

export async function register(
    userData: UserDto
): Promise<OperationResult<User>> {
    const existingUser = await User.findByEmail(userData.email);

    if (existingUser) {
        return {
            error: `User with email ${userData.email} already exists`,
        };
    }

    userData.hash = await generateHash(userData.hash);
    const user = await User.create(userData);
    if (!user) {
        return {
            error: `Failed to create user`,
        };
    }

    return { data: user };
}

async function generateHash(s: string): Promise<string> {
    try {
        const hash = await bcrypt.hash(s, saltRounds);
        return hash;
    } catch (error) {
        throw new Error(`Error hasing ${s}. Error: ${JSON.stringify(error)}`);
    }
}
