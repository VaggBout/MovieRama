import { describe, expect, jest, test } from "@jest/globals";
import * as UserMiddleware from "../../src/middlewares/user";
import * as UserService from "../../src/services/user";
import { User } from "../../src/models/user";
import express from "express";

describe("User middlewares", () => {
    describe("Validate registration middleware", () => {
        test("should respond with error when body is invalid", () => {
            const next = jest.fn();
            const req = {
                body: {
                    email: "test@email.com",
                    name: "test name",
                },
            } as express.Request;

            const res = {
                statusCode: 0,
                send: jest.fn().mockImplementationOnce((body: any) => {
                    expect(body.error).toBe("Invalid body");
                }),
            } as unknown as express.Response;

            UserMiddleware.validateRegisterReq(req, res, next);
            expect(res.statusCode).toBe(400);
            expect(next).not.toHaveBeenCalled();
        });

        test("should invoke next when request is valid", () => {
            const next = jest.fn();
            const req = {
                body: {
                    email: "test@email.com",
                    name: "test name",
                    password: "password",
                },
            } as express.Request;

            const res = {
                statusCode: 0,
                send: jest.fn().mockImplementationOnce(() => {
                    throw new Error("Should not be called");
                }),
            } as unknown as express.Response;

            UserMiddleware.validateRegisterReq(req, res, next);
            expect(res.statusCode).toBe(0);
            expect(next).toHaveBeenCalled();
        });
    });

    describe("Validate login middleware", () => {
        test("should respond with error when body is invalid", () => {
            const next = jest.fn();
            const req = {
                body: {
                    email: "test@email.com",
                },
            } as express.Request;

            const res = {
                statusCode: 0,
                send: jest.fn().mockImplementationOnce((body: any) => {
                    expect(body.error).toBe("Invalid body");
                }),
            } as unknown as express.Response;

            UserMiddleware.validateLoginReq(req, res, next);
            expect(res.statusCode).toBe(400);
            expect(next).not.toHaveBeenCalled();
        });

        test("should invoke next when request is valid", () => {
            const next = jest.fn();
            const req = {
                body: {
                    email: "test@email.com",
                    password: "password",
                },
            } as express.Request;

            const res = {
                statusCode: 0,
                send: jest.fn().mockImplementationOnce(() => {
                    throw new Error("Should not be called");
                }),
            } as unknown as express.Response;

            UserMiddleware.validateLoginReq(req, res, next);
            expect(res.statusCode).toBe(0);
            expect(next).toHaveBeenCalled();
        });
    });

    describe("Populate authenticated user", () => {
        test("Should invoke next when token is missing", async () => {
            const next = jest.fn();
            const req = {
                cookies: {},
            } as express.Request;

            const res = {} as express.Response;

            await UserMiddleware.populateAuthUser(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        test("Should invoke next when token is invalid", async () => {
            const next = jest.fn();
            const req = {
                cookies: {
                    token: "invalid-token",
                },
            } as express.Request;

            const res = {} as express.Response;
            await UserMiddleware.populateAuthUser(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        test("Should populate response with user and invoke next when token is valid", async () => {
            const mockValidateToken = jest
                .spyOn(UserService, "validateToken")
                .mockImplementationOnce(() => {
                    return {
                        id: 1,
                        email: "test@email.com",
                        name: "test",
                        exp: 123,
                    };
                });

            const mockFindById = jest
                .spyOn(User, "findById")
                .mockImplementationOnce(() => {
                    const user = new User(1, "test@email.com", "test", "hash");
                    return Promise.resolve(user);
                });

            const next = jest.fn();
            const req = {
                cookies: {
                    token: "valid-token",
                },
            } as express.Request;
            const res = {
                locals: {},
            } as express.Response;

            await UserMiddleware.populateAuthUser(req, res, next);
            expect(res.locals.user).toBeDefined();
            expect(res.locals.user.id).toBe(1);

            expect(next).toHaveBeenCalled();
            expect(mockFindById).toHaveBeenCalledTimes(1);
            expect(mockValidateToken).toHaveBeenCalledTimes(1);

            mockFindById.mockClear();
            mockValidateToken.mockClear();
        });
    });
});
