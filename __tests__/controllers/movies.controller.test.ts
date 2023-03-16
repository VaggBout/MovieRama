import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as MoviesController from "../../src/controllers/api/movies";
import { Movie } from "../../src/models/movie";
import * as MovieService from "../../src/services/movie";
import express from "express";
import { DateTime } from "luxon";

describe("Movie controller", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should respond with movie object when create is success", async () => {
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

            await MoviesController.post(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
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

            await MoviesController.post(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(400);
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

            await MoviesController.post(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(500);
        });
    });

    describe("get", () => {
        test("returns rendered html and totalMovies", async () => {
            const mockGetMoviesPage = jest
                .spyOn(MovieService, "getMoviesPage")
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        data: {
                            movies: [
                                {
                                    id: 1,
                                    title: "test",
                                    description: "test",
                                    daysElapsed: "test",
                                    userId: 1,
                                    userName: "test",
                                    likes: 1,
                                    hates: 1,
                                    vote: true,
                                },
                            ],
                            totalMovies: 1,
                        },
                    })
                );

            const req = {
                query: {
                    order: "likes",
                    sort: "ASC",
                    page: 2,
                },
                send: jest.fn(),
                app: {
                    render: jest
                        .fn()
                        .mockImplementationOnce((_file, _data, cb: any) =>
                            cb(null, "test html")
                        ),
                },
            } as unknown as express.Request;

            const res = {
                locals: {
                    user: { id: 1 },
                },
                send: jest.fn(),
            } as unknown as express.Response;

            await MoviesController.get(req, res);
            expect(mockGetMoviesPage).toHaveBeenCalledTimes(1);
            expect(mockGetMoviesPage).toHaveBeenCalledWith(
                "ASC",
                5,
                10,
                "likes",
                1,
                null
            );
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({
                html: "test html",
                data: { totalMovies: 1 },
            });
            expect(req.app.render).toHaveBeenCalledTimes(1);
        });

        test("respond with 500 when movies service throws", async () => {
            const mockGetMoviesPage = jest
                .spyOn(MovieService, "getMoviesPage")
                .mockImplementationOnce(() => {
                    throw new Error("test");
                });

            const req = {
                query: {},
                send: jest.fn(),
            } as unknown as express.Request;

            const res = {
                statusCode: 0,
                locals: {
                    user: { id: 1 },
                },
                send: jest.fn(),
            } as unknown as express.Response;

            await MoviesController.get(req, res);
            expect(mockGetMoviesPage).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(500);
        });
    });
});
