import { describe, expect, jest, test } from "@jest/globals";
import * as RegisterMiddleware from "../../src/middlewares/register";
import express from "express";

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
                expect(body.error).toBe('"password" is required');
            }),
        } as unknown as express.Response;

        RegisterMiddleware.validateRegisterReq(req, res, next);
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

        RegisterMiddleware.validateRegisterReq(req, res, next);
        expect(res.statusCode).toBe(0);
        expect(next).toHaveBeenCalled();
    });
});
