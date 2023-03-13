import { describe, expect, jest, test } from "@jest/globals";
import * as MovieMiddleware from "../../src/middlewares/movie";
import express from "express";

describe("Movie middleware", () => {
    describe("Validate create new movie request", () => {
        test("should respond with 401 when user is not logged in", () => {
            const next = jest.fn();
            const req = {} as express.Request;

            const res = {
                locals: {},
                statusCode: 0,
                send: jest.fn(),
            } as unknown as express.Response;

            MovieMiddleware.validateCreateMovieReq(req, res, next);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(401);
        });

        test("should respond with 400 when body is invalid", () => {
            const next = jest.fn();
            const req = {
                body: {
                    title: "test",
                },
            } as express.Request;

            const res = {
                locals: {
                    user: {},
                },
                statusCode: 0,
                send: jest.fn().mockImplementationOnce((body: any) => {
                    expect(body.error).toBe("Invalid body");
                }),
            } as unknown as express.Response;

            MovieMiddleware.validateCreateMovieReq(req, res, next);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(400);
        });

        test("should invoke next when request is valid", () => {
            const next = jest.fn();
            const req = {
                body: {
                    title: "test",
                    description: "test desc",
                },
            } as express.Request;

            const res = {
                locals: {
                    user: {},
                },
                statusCode: 0,
                send: jest.fn().mockImplementationOnce((body: any) => {
                    throw new Error("Should not be called");
                }),
            } as unknown as express.Response;

            MovieMiddleware.validateCreateMovieReq(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    describe("Validate get movies api request middleware", () => {
        test("should respond with 400 when params contain at least one invalid value", () => {
            const next = jest.fn();
            const req = {
                query: {
                    order: "invalid",
                    sort: "DESC",
                    page: 1,
                    limit: 5,
                },
            } as unknown as express.Request;

            const res = {
                statusCode: 0,
                send: jest.fn(),
            } as unknown as express.Response;

            MovieMiddleware.validateApiMoviesReq(req, res, next);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(400);
        });

        test("should invoke next when request has no query parameter", () => {
            const next = jest.fn();
            const req = {
                query: {},
            } as unknown as express.Request;

            const res = {
                statusCode: 0,
            } as unknown as express.Response;

            MovieMiddleware.validateApiMoviesReq(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });

        test("should invoke next when request has valid query parameters", () => {
            const next = jest.fn();
            const req = {
                query: {
                    order: "date",
                    sort: "DESC",
                    page: 1,
                    limit: 5,
                },
            } as unknown as express.Request;

            const res = {
                statusCode: 0,
            } as unknown as express.Response;

            MovieMiddleware.validateApiMoviesReq(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });

        test("should invoke next when request contains irrelevant query parameters", () => {
            const next = jest.fn();
            const req = {
                query: {
                    test: "test",
                },
            } as unknown as express.Request;

            const res = {
                statusCode: 0,
            } as unknown as express.Response;

            MovieMiddleware.validateApiMoviesReq(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    describe("Validate render movies request middleware", () => {
        test("should remove parameter and invoke next when params contain at least one invalid value", () => {
            const next = jest.fn();
            const req = {
                query: {
                    order: "invalid",
                    sort: "DESC",
                    page: 1,
                    limit: 5,
                },
            } as unknown as express.Request;

            const res = {} as unknown as express.Response;

            MovieMiddleware.validateRenderMoviesReq(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(Object.keys(req.query).length).toBe(0);
        });

        test("should invoke next when params are valid", () => {
            const next = jest.fn();
            const req = {
                query: {
                    order: "date",
                    sort: "DESC",
                    page: 1,
                    limit: 5,
                },
            } as unknown as express.Request;

            const res = {} as unknown as express.Response;

            MovieMiddleware.validateRenderMoviesReq(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(Object.keys(req.query).length).toBe(4);
        });
    });
});
