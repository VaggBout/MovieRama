import { User } from "../models/user";
import { OperationResult } from "../types/common";
import * as bcrypt from "bcrypt";
import { UserDto } from "../types/dto";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";
import { JwtToken } from "../types/auth";
import config from "../utils/config";

const saltRounds = 10;
const jwtSignature = config.tokenSecret;

export async function register(
    userData: UserDto,
    password: string
): Promise<OperationResult<User>> {
    const existingUser = await User.findByEmail(userData.email);

    if (existingUser) {
        return {
            error: `User with email ${userData.email} already exists`,
        };
    }

    const hash = await generateHash(password);
    const user = await User.create(userData, hash);

    if (!user) {
        return {
            error: "Failed to create user",
        };
    }

    return { data: user };
}

export async function find(id: number): Promise<OperationResult<User>> {
    const user = await User.findById(id);

    if (!user) {
        return {
            error: `User with ${id} does not exist`,
        };
    }

    return {
        data: user,
    };
}

/**
 * Tries to authenticate the provided credentials. If the credentials match
 * a `User` instance is returned
 * @param email
 * @param password
 * @returns
 */
export async function auth(
    email: string,
    password: string
): Promise<OperationResult<User>> {
    const user = await User.findByEmail(email);

    if (!user) {
        logger.warn(`User ${email} does not exist`);
        return {
            error: "Invalid credentials",
        };
    }

    const hasValidCreds = await bcrypt.compare(password, user.hash);
    if (!hasValidCreds) {
        logger.warn(`Invalid credentials for user ${email}`);
        return {
            error: "Invalid credentials",
        };
    }

    return { data: user };
}

export function generateAuthToken(user: User): string {
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        jwtSignature,
        { expiresIn: "30d" }
    );

    return token;
}

async function generateHash(s: string): Promise<string> {
    try {
        const hash = await bcrypt.hash(s, saltRounds);
        return hash;
    } catch (error) {
        throw new Error(`Error hashing ${s}. Error: ${JSON.stringify(error)}`);
    }
}

export function validateToken(token: string): JwtToken | null {
    try {
        const tokenData = jwt.verify(token, jwtSignature, {
            ignoreExpiration: false,
        }) as JwtToken;

        return tokenData;
    } catch (error) {
        logger.warn(`Failed to verify token: ${token}`);
        return null;
    }
}
