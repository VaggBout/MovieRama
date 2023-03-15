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
    cleanDb,
} from "./setup";
import { Express } from "express";
import request from "supertest";
import { User } from "../src/models/user";

describe("Register (e2e)", () => {
    let app: Express;
    const dbName = "register";

    beforeAll(async () => {
        await buildDatabaseAndSchema(dbName);
        app = buildMockApp();
        await initDbConnection(dbName);
    });

    afterAll(async () => {
        await teardownDatabase(dbName);
    });

    beforeEach(async () => {
        await cleanDb();
    });

    test("Should register new user when email does not exist", async () => {
        const body = {
            email: "email@test.com",
            name: "test",
            password: "password!",
        };

        const response = await request(app)
            .post("/api/register")
            .send(body)
            .expect(200);

        expect(response.body.data.id).toBeDefined();
        const user = await User.findById(response.body.data.id);
        expect(user?.email).toBe(body.email);
    });

    test("Should respond with error when provided email already exists", async () => {
        await User.create({
            email: "email@test.com",
            name: "test",
            hash: "hash",
        });

        const body = {
            email: "email@test.com",
            name: "test2",
            password: "password!",
        };

        const response = await request(app)
            .post("/api/register")
            .send(body)
            .expect(400);

        expect(response.body.error).toBe(
            "User with email email@test.com already exists"
        );
    });
});
