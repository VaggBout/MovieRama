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
import * as MovieService from "../src/services/movie";
import * as UserService from "../src/services/user";
import * as VoteService from "../src/services/vote";
import { DateTime } from "luxon";

describe("Votes (e2e)", () => {
    let app: Express;
    const dbName = "login";

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

    test("should respond with error when creator tries to vote his movie", async () => {
        const result = await UserService.register({
            name: "test",
            email: "test@email.com",
            hash: "password!",
        });
        expect(result.error).toBeUndefined();

        await MovieService.create({
            title: "test_movie",
            description: "test desc",
            userId: result.data?.id ? result.data.id : 1,
            date: DateTime.now(),
        });

        const loginBody = {
            email: "test@email.com",
            password: "password!",
        };

        const createVoteBody = {
            movieId: 1,
            like: false,
        };

        const agent = request.agent(app);
        const response = await agent
            .post("/api/login")
            .send(loginBody)
            .expect(200)
            .then(() =>
                agent.post("/api/votes").send(createVoteBody).expect(400)
            );
        expect(response.body.error).toBe(
            "User who submitted the movie can't vote it"
        );
    });

    test("should respond with vote date when vote is created", async () => {
        const user1Result = await UserService.register({
            name: "test",
            email: "test@email.com",
            hash: "password!",
        });
        expect(user1Result.error).toBeUndefined();

        const user2Result = await UserService.register({
            name: "test",
            email: "test2@email.com",
            hash: "password!",
        });
        expect(user2Result.error).toBeUndefined();

        await MovieService.create({
            title: "test_movie",
            description: "test desc",
            userId: user1Result.data?.id ? user1Result.data.id : 1,
            date: DateTime.now(),
        });

        const loginBody = {
            email: "test2@email.com",
            password: "password!",
        };

        const createVoteBody = {
            movieId: 1,
            like: false,
        };

        const agent = request.agent(app);
        const response = await agent
            .post("/api/login")
            .send(loginBody)
            .expect(200)
            .then(() =>
                agent.post("/api/votes").send(createVoteBody).expect(200)
            );
        expect(response.body.data.like).toBe(false);
    });

    test("should respond 200 when vote is removed", async () => {
        const user1Result = await UserService.register({
            name: "test",
            email: "test@email.com",
            hash: "password!",
        });
        expect(user1Result.error).toBeUndefined();

        const user2Result = await UserService.register({
            name: "test",
            email: "test2@email.com",
            hash: "password!",
        });
        expect(user2Result.error).toBeUndefined();

        const movieResult = await MovieService.create({
            title: "test_movie",
            description: "test desc",
            userId: user1Result.data?.id ? user1Result.data.id : 1,
            date: DateTime.now(),
        });
        expect(movieResult.error).toBeUndefined();

        await VoteService.create({
            userId: user2Result.data?.id ? user2Result.data.id : 2,
            movieId: movieResult.data?.id ? movieResult.data?.id : 1,
            like: true,
        });

        const loginBody = {
            email: "test2@email.com",
            password: "password!",
        };

        const agent = request.agent(app);
        await agent
            .post("/api/login")
            .send(loginBody)
            .expect(200)
            .then(() =>
                agent.delete(`/api/votes/${movieResult.data?.id}`).expect(200)
            );
    });

    test("should respond with error when movie does not exist", async () => {
        const user1Result = await UserService.register({
            name: "test",
            email: "test@email.com",
            hash: "password!",
        });
        expect(user1Result.error).toBeUndefined();

        const loginBody = {
            email: "test@email.com",
            password: "password!",
        };

        const agent = request.agent(app);
        const response = await agent
            .post("/api/login")
            .send(loginBody)
            .expect(200)
            .then(() => agent.delete("/api/votes/1").expect(400));

        expect(response.body.error).toBe("Failed to remove vote entry");
    });
});
