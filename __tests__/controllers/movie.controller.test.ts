import { describe, expect, jest, test } from "@jest/globals";
import * as MovieController from "../../src/controllers/movie";
import { Movie } from "../../src/models/movie";
import * as MovieService from "../../src/services/movie";
import express from "express";
import { DateTime } from "luxon";

describe("Movie controller", () => {
    describe("create", () => {
        test("should respond with movie object when create is sucess", async () => {
            const mockCreate = jest
                .spyOn(MovieService, "create")
                .mockImplementationOnce(() => {
                    const movie = new Movie(
                        1,
                        "test",
                        "test desc",
                        1,
                        DateTime.now()
                    );
                    return Promise.resolve({ data: movie });
                });

            const req = {
                body: {
                    title: "test",
                    description: "test desc",
                },
            } as express.Request;
            const res = {
                locals: {
                    user: {
                        id: 1,
                    },
                },
                send: jest.fn().mockImplementationOnce((body: any) => {
                    expect(body.title).toBe("test");
                }),
            } as unknown as express.Response;

            await MovieController.createMovie(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);

            mockCreate.mockClear();
        });

        test("should respond with 400 when service returns error", async () => {
            const mockCreate = jest
                .spyOn(MovieService, "create")
                .mockImplementationOnce(() =>
                    Promise.resolve({ error: "Test error" })
                );

            const req = {
                body: {
                    title: "test",
                    description: "test desc",
                },
            } as express.Request;
            const res = {
                locals: {
                    user: {
                        id: 1,
                    },
                },
                send: jest.fn().mockImplementationOnce((body: any) => {
                    expect(body.error).toBe("Test error");
                }),
                statusCode: 0,
            } as unknown as express.Response;

            await MovieController.createMovie(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(400);

            mockCreate.mockClear();
        });

        test("should respond with 500 when service throws error", async () => {
            const mockCreate = jest
                .spyOn(MovieService, "create")
                .mockImplementationOnce(() => {
                    throw new Error("Test error");
                });

            const req = {
                body: {
                    title: "test",
                    description: "test desc",
                },
            } as express.Request;
            const res = {
                locals: {
                    user: {
                        id: 1,
                    },
                },
                send: jest.fn().mockImplementationOnce((body: any) => {
                    expect(body.error).toBe("Something went wrong!");
                }),
                statusCode: 0,
            } as unknown as express.Response;

            await MovieController.createMovie(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(500);

            mockCreate.mockClear();
        });
    });
});
