import { describe, expect, jest, test } from "@jest/globals";
import * as UserService from "../../src/services/user";
import express from "express";
import { User } from "../../src/models/user";
import * as LoginApiController from "../../src/controllers/api/login";

describe("login", () => {
    test("should add cookie when login is success", async () => {
        const mockAuth = jest
            .spyOn(UserService, "auth")
            .mockImplementationOnce(() => {
                const user = new User(1, "test@email.com", "test", "hash");
                return Promise.resolve({ data: user });
            });

        const req = {
            body: {
                email: "test",
                password: "test",
            },
        } as express.Request;

        const res = {
            send: jest.fn(),
            cookie: jest
                .fn()
                .mockImplementationOnce((name, _value, opt: any) => {
                    expect(name).toBe("token");
                    expect(opt.expires).toBeDefined();
                }),
        } as unknown as express.Response;

        await LoginApiController.post(req, res);
        expect(mockAuth).toHaveBeenCalledTimes(1);

        mockAuth.mockClear();
    });

    test("should respond with error when login is failed", async () => {
        const mockAuth = jest
            .spyOn(UserService, "auth")
            .mockImplementationOnce(() => {
                return Promise.resolve({ error: "Test error" });
            });

        const req = {
            body: {
                email: "test",
                password: "test",
            },
        } as express.Request;

        const res = {
            send: jest.fn().mockImplementationOnce((body: any) => {
                expect(body.error).toBe("Test error");
            }),
            cookie: jest.fn().mockImplementationOnce(() => {
                throw new Error("Should not be called!");
            }),
            statusCode: 0,
        } as unknown as express.Response;

        await LoginApiController.post(req, res);
        expect(mockAuth).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(400);
        mockAuth.mockClear();
    });

    test("should respond with error 500 when service throws", async () => {
        const mockAuth = jest
            .spyOn(UserService, "auth")
            .mockImplementationOnce(() => {
                throw new Error("Test error");
            });

        const req = {
            body: {
                email: "test",
                password: "test",
            },
        } as express.Request;

        const res = {
            send: jest.fn().mockImplementationOnce((body: any) => {
                expect(body.error).toBe("Something went wrong!");
            }),
            cookie: jest.fn().mockImplementationOnce(() => {
                throw new Error("Should not be called!");
            }),
            statusCode: 0,
        } as unknown as express.Response;

        await LoginApiController.post(req, res);
        expect(mockAuth).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(500);
        mockAuth.mockClear();
    });
});
