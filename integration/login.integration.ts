import {
    afterAll,
    beforeAll,
    describe,
    expect,
    test,
    beforeEach,
} from "@jest/globals";
import {
    buildDatabaseAndSchema,
    teardownDatabase,
    buildMockApp,
    initDbConnection,
} from "./setup";
import { Express } from "express";
import request from "supertest";
import * as UserService from "../src/services/user";
import { cleanDb } from "./utils";
import { UserDto } from "../src/types/dto";

describe("Login (e2e)", () => {
    let app: Express;
    const dbName = "login";

    beforeAll(async () => {
        try {
            await buildDatabaseAndSchema(dbName);
            app = buildMockApp();
            await initDbConnection(dbName);
        } catch (error) {
            throw error;
        }
    });

    afterAll(async () => {
        await teardownDatabase(dbName);
    });

    beforeEach(async () => {
        await cleanDb();
    });

    test("Should have cookie when login is success", async () => {
        const userDto: UserDto = {
            name: "test",
            email: "test@email.com",
            hash: "password!",
        };

        const result = await UserService.register(userDto);
        expect(result.error).toBeUndefined();

        const body = {
            email: "test@email.com",
            password: "password!",
        };

        const response = await request(app)
            .post("/api/login")
            .send(body)
            .expect(200);

        expect(response.headers["set-cookie"]).toBeDefined();
        const cookies = response.headers["set-cookie"];
        expect(cookies[0].startsWith("token=")).toBe(true);
    });

    test("Should respond error when credentials are invalid", async () => {
        const body = {
            email: "invalid@email.com",
            password: "password!",
        };

        const response = await request(app)
            .post("/api/login")
            .send(body)
            .expect(400);
        expect(response.body.error).toBe("Invalid credentials");
    });
});
