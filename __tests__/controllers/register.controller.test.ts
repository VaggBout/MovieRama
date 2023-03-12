import { describe, expect, jest, test } from "@jest/globals";
import * as RegisterApiController from "../../src/controllers/api/register";
import { User } from "../../src/models/user";
import * as UserService from "../../src/services/user";
import express from "express";

describe("register", () => {
    test("should respond with user object when register is successful", async () => {
        const mockRegister = jest
            .spyOn(UserService, "register")
            .mockImplementationOnce(() => {
                const user = new User(1, "test@email.com", "test", "hash");
                return Promise.resolve({ data: user });
            });

        const req = {} as express.Request;
        const res = {
            send: jest.fn().mockImplementationOnce((body: any) => {
                expect(body).toHaveProperty("data");
                expect(body["data"]).toHaveProperty("id");
            }),
        } as unknown as express.Response;

        req.body = {
            email: "test@email.com",
            name: "test",
            password: "hash",
        };

        await RegisterApiController.post(req, res);
        expect(mockRegister).toHaveBeenCalledTimes(1);

        mockRegister.mockClear();
    });

    test("should respond with error when registration fails", async () => {
        const mockRegister = jest
            .spyOn(UserService, "register")
            .mockImplementationOnce(() =>
                Promise.resolve({ error: "Test error" })
            );

        const req = {} as express.Request;
        const res = {
            send: jest.fn().mockImplementationOnce((body: any) => {
                expect(body).toHaveProperty("error");
                expect(body["error"]).toBe("Test error");
            }),
        } as unknown as express.Response;
        res.statusCode = 0;
        req.body = {
            email: "test@email.com",
            name: "test",
            password: "hash",
        };

        await RegisterApiController.post(req, res);
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(400);

        mockRegister.mockClear();
    });

    test("should respond with 500 error when service throws", async () => {
        const mockRegister = jest
            .spyOn(UserService, "register")
            .mockImplementationOnce(() => {
                throw new Error("Test error");
            });

        const req = {} as express.Request;
        const res = {
            send: jest.fn().mockImplementationOnce((body: any) => {
                expect(body).toHaveProperty("error");
                expect(body["error"]).toBe("Something went wrong!");
            }),
        } as unknown as express.Response;
        res.statusCode = 0;
        req.body = {
            email: "test@email.com",
            name: "test",
            password: "hash",
        };

        await RegisterApiController.post(req, res);
        expect(mockRegister).toHaveBeenCalledTimes(1);
        expect(res.statusCode).toBe(500);

        mockRegister.mockClear();
    });
});
