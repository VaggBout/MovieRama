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
import * as UserService from "../src/services/user";
import * as MovieService from "../src/services/movie";
import { DateTime } from "luxon";
import { JSDOM } from "jsdom";

describe("Home page (e2e)", () => {
    let app: Express;
    const dbName = "home";

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

    test("Should render homepage with correct data for non-logged-in user", async () => {
        const result = await UserService.register(
            {
                name: "test",
                email: "test@email.com",
            },
            "password!"
        );
        expect(result.error).toBeUndefined();

        await MovieService.create({
            title: "test",
            description: "test desc",
            userId: result.data?.id ? result.data.id : 1,
            date: DateTime.now(),
        });

        const response = await request(app).get("/").expect(200);
        expect(response.text).toBeDefined();
        const dom = new JSDOM(response.text);
        const document = dom.window.document;

        const loginModal = document.querySelector("#loginModal");
        const registerModal = document.querySelector("#registerModal");
        const movieEntry = document.querySelector("#movie_1");

        expect(loginModal?.id).toBeDefined();
        expect(registerModal?.id).toBeDefined();
        expect(movieEntry?.id).toBeDefined();
    });

    test("Should render homepage with correct data for logged-in user", async () => {
        const user1Result = await UserService.register(
            {
                name: "test",
                email: "test@email.com",
            },
            "password!"
        );
        expect(user1Result.error).toBeUndefined();

        const user2Result = await UserService.register(
            {
                name: "test",
                email: "test2@email.com",
            },
            "password!"
        );
        expect(user2Result.error).toBeUndefined();

        await MovieService.create({
            title: "test",
            description: "test desc",
            userId: user1Result.data?.id ? user1Result.data.id : 1,
            date: DateTime.now(),
        });

        await MovieService.create({
            title: "test2",
            description: "test desc",
            userId: user2Result.data?.id ? user2Result.data.id : 1,
            date: DateTime.now(),
        });

        const loginBody = {
            email: "test2@email.com",
            password: "password!",
        };

        const agent = request.agent(app);
        const response = await agent
            .post("/api/login")
            .send(loginBody)
            .expect(200)
            .then(() => agent.get("/").expect(200));

        expect(response.text).toBeDefined();
        const dom = new JSDOM(response.text);
        const document = dom.window.document;

        const loginModal = document.querySelector("#loginModal");
        const registerModal = document.querySelector("#registerModal");
        const movie1Entry = document.querySelector("#movie_1");
        const movie2Entry = document.querySelector("#movie_2");
        const element = document.querySelector("#movie_1 div div div p a");

        expect(loginModal?.id).not.toBeDefined();
        expect(registerModal?.id).not.toBeDefined();
        expect(movie1Entry?.id).toBeDefined();
        expect(movie2Entry?.id).toBeDefined();
        expect(element?.getAttribute("data-action")).toBe("like");
        expect(element?.getAttribute("data-movie")).toBe("1");
    });
});
