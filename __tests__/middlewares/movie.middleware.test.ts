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
});
