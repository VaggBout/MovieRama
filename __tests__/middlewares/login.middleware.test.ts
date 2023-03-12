import { describe, expect, jest, test } from "@jest/globals";
import * as LoginMiddleware from "../../src/middlewares/login";
import express from "express";

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

        LoginMiddleware.validateLoginReq(req, res, next);
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

        LoginMiddleware.validateLoginReq(req, res, next);
        expect(res.statusCode).toBe(0);
        expect(next).toHaveBeenCalled();
    });
});
