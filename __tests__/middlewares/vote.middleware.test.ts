import { describe, expect, jest, test } from "@jest/globals";
import * as VoteMiddleware from "../../src/middlewares/vote";
import express from "express";

describe("Vote middleware", () => {
    describe("Validate create new vote request", () => {
        test("should respond with 401 when user is not logged in", () => {
            const next = jest.fn();
            const req = {} as express.Request;

            const res = {
                locals: {},
                statusCode: 0,
                send: jest.fn(),
            } as unknown as express.Response;

            VoteMiddleware.validateCreateVoteReq(req, res, next);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(401);
        });

        test("should respond with 400 when body is invalid", () => {
            const next = jest.fn();
            const req = {
                body: {
                    movieId: 1,
                    like: null,
                },
            } as express.Request;

            const res = {
                locals: {
                    user: {},
                },
                statusCode: 0,
                send: jest.fn().mockImplementationOnce((body: any) => {
                    expect(body.error).toBe('"like" must be a boolean');
                }),
            } as unknown as express.Response;

            VoteMiddleware.validateCreateVoteReq(req, res, next);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(400);
        });

        test("should invoke next when request is valid", () => {
            const next = jest.fn();
            const req = {
                body: {
                    movieId: 1,
                    like: false,
                },
            } as express.Request;

            const res = {
                locals: {
                    user: {},
                },
                statusCode: 0,
                send: jest.fn().mockImplementationOnce(() => {
                    throw new Error("Should not be called");
                }),
            } as unknown as express.Response;

            VoteMiddleware.validateCreateVoteReq(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    describe("Validate remove vote request", () => {
        test("should invoke next when request is valid", () => {
            const next = jest.fn();
            const req = {
                query: {
                    movieId: 1,
                },
            } as unknown as express.Request;

            const res = {
                locals: {
                    user: {},
                },
                send: jest.fn(),
            } as unknown as express.Response;

            VoteMiddleware.validateRemoveVoteReq(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(res.send).not.toHaveBeenCalled();
        });

        test("should respond with 401 when user is not logged in", () => {
            const next = jest.fn();
            const req = {
                query: {
                    movieId: 1,
                },
            } as unknown as express.Request;

            const res = {
                locals: {},
                statusCode: 0,
                send: jest.fn(),
            } as unknown as express.Response;

            VoteMiddleware.validateRemoveVoteReq(req, res, next);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(401);
        });

        test("should respond with 400 when url params are invalid", () => {
            const next = jest.fn();
            const req = {
                query: {
                    movieId: "invalid-params",
                },
            } as unknown as express.Request;

            const res = {
                locals: {
                    user: {},
                },
                statusCode: 0,
                send: jest.fn(),
            } as unknown as express.Response;

            VoteMiddleware.validateRemoveVoteReq(req, res, next);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(400);
        });
    });
});
