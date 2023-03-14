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
import { cleanDb } from "./utils";
import * as UserService from "../src/services/user";
import * as MovieService from "../src/services/movie";
import { DateTime } from "luxon";
import { JSDOM } from "jsdom";

describe("Movie (e2e)", () => {
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

    test("Should respond with movie data when movie is created", async () => {
        const result = await UserService.register({
            name: "test",
            email: "test@email.com",
            hash: "password!",
        });
        expect(result.error).toBeUndefined();

        const loginBody = {
            email: "test@email.com",
            password: "password!",
        };

        const createMovieBody = {
            title: "test",
            description: "description",
        };

        const agent = request.agent(app);
        const response = await agent
            .post("/api/login")
            .send(loginBody)
            .expect(200)
            .then(() =>
                agent.post("/api/movies").send(createMovieBody).expect(200)
            );

        expect(response.body.data.id).toBeDefined();
    });

    test("Should respond with error when user is not logged in", async () => {
        const createMovieBody = {
            title: "test",
            description: "description",
        };

        await request(app)
            .post("/api/movies")
            .send(createMovieBody)
            .expect(401);
    });

    test("should respond with error when movie title already exists", async () => {
        const result = await UserService.register({
            name: "test",
            email: "test@email.com",
            hash: "password!",
        });
        expect(result.error).toBeUndefined();

        await MovieService.create({
            title: "test",
            description: "test desc",
            userId: result.data?.id ? result.data.id : 1,
            date: DateTime.now(),
        });

        const loginBody = {
            email: "test@email.com",
            password: "password!",
        };

        const createMovieBody = {
            title: "test",
            description: "description",
        };

        const agent = request.agent(app);
        const response = await agent
            .post("/api/login")
            .send(loginBody)
            .expect(200)
            .then(() =>
                agent.post("/api/movies").send(createMovieBody).expect(400)
            );

        expect(response.body.error).toBe(
            "Movie with title test already exists"
        );
    });

    test("Should respond with correct rendered html of a movies page based on query", async () => {
        const result = await UserService.register({
            name: "test",
            email: "test@email.com",
            hash: "password!",
        });
        expect(result.error).toBeUndefined();

        // Create 5 movies
        for (let i = 0; i < 5; i++) {
            await MovieService.create({
                title: `test_${i}`,
                description: "test desc",
                userId: result.data?.id ? result.data.id : 1,
                date: DateTime.now().minus({ days: i }),
            });
        }

        const limitTwoResponse = await request(app)
            .get("/api/movies")
            .query({
                page: 0,
                limit: 2,
            })
            .expect(200);
        expect(limitTwoResponse.body.data.totalMovies).toBe("5");
        const limitTwoDom = new JSDOM("<!DOCTYPE html>");
        const limitTwoDocument = limitTwoDom.window.document;
        const limitTwoDiv = limitTwoDocument.createElement("div");
        limitTwoDiv.innerHTML = limitTwoResponse.body.html;
        expect(limitTwoDiv.childElementCount).toBe(2);

        const limitTenResponse = await request(app)
            .get("/api/movies")
            .query({
                page: 0,
                limit: 10,
            })
            .expect(200);
        expect(limitTenResponse.body.data.totalMovies).toBe("5");
        const limitTenDom = new JSDOM("<!DOCTYPE html>");
        const limitTenDocument = limitTenDom.window.document;
        const limitTenDiv = limitTenDocument.createElement("div");
        limitTenDiv.innerHTML = limitTenResponse.body.html;
        expect(limitTenDiv.childElementCount).toBe(5);

        const limitTenSortDateResponse = await request(app)
            .get("/api/movies")
            .query({
                page: 0,
                limit: 10,
                order: "date",
                sort: "DESC",
            })
            .expect(200);
        expect(limitTenSortDateResponse.body.data.totalMovies).toBe("5");
        const limitTenSortDateDom = new JSDOM("<!DOCTYPE html>");
        const limitTenSortDateDocument = limitTenSortDateDom.window.document;
        const limitTenSortDateDiv =
            limitTenSortDateDocument.createElement("div");
        limitTenSortDateDiv.innerHTML = limitTenSortDateResponse.body.html;
        expect(limitTenSortDateDiv.childElementCount).toBe(5);

        limitTenSortDateDom.window.document.body.appendChild(
            limitTenSortDateDiv
        );

        const elements =
            limitTenSortDateDocument.getElementsByClassName("_movie_entry");
        for (let i = 0; i < elements.length; i++) {
            const element = elements.item(i);
            // Since we sort by date DESC, where smaller id === newer movie,
            // we expect element ids to be sequential
            expect(element?.id).toBe(`movie_${i + 1}`);
        }
    });
});
