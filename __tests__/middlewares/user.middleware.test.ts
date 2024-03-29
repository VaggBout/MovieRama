import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as UserMiddleware from "../../src/middlewares/user";
import * as UserService from "../../src/services/user";
import { User } from "../../src/models/user";
import express from "express";

describe("User middlewares", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
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
        });
    });

    describe("Validate user id parameter", () => {
        test("invokes next on valid id", () => {
            const next = jest.fn();
            const req = {
                params: {
                    id: 1,
                },
            } as unknown as express.Request;
            const res = {
                locals: {},
            } as express.Response;

            UserMiddleware.validateUserIdParam(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
        });

        test("redirects to 404 when user id is invalid", () => {
            const next = jest.fn();
            const req = {
                params: {
                    id: "invalid-id",
                },
            } as unknown as express.Request;
            const res = {
                locals: {},
                redirect: jest.fn(),
            } as unknown as express.Response;

            UserMiddleware.validateUserIdParam(req, res, next);
            expect(res.redirect).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledWith("/404");
            expect(next).not.toHaveBeenCalled();
        });
    });
});
