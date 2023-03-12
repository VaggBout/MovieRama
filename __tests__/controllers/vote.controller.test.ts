import { describe, expect, jest, test } from "@jest/globals";
import * as VoteController from "../../src/controllers/vote";
import { Vote } from "../../src/models/vote";
import * as VoteService from "../../src/services/vote";
import express from "express";

describe("Vote controller", () => {
    describe("create", () => {
        test("should respond with vote object when create is success", async () => {
            const mockCreate = jest
                .spyOn(VoteService, "create")
                .mockImplementationOnce(() => {
                    const vote = new Vote(1, 1, true);
                    return Promise.resolve({ data: vote });
                });

            const req = {
                body: {
                    movieId: 1,
                    like: true,
                },
            } as express.Request;
            const res = {
                locals: {
                    user: {
                        id: 1,
                    },
                },
                send: jest.fn().mockImplementationOnce((body: any) => {
                    expect(body.like).toBe(true);
                }),
            } as unknown as express.Response;

            await VoteController.create(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);

            mockCreate.mockClear();
        });

        test("should respond with 400 when service returns error", async () => {
            const mockCreate = jest
                .spyOn(VoteService, "create")
                .mockImplementationOnce(() =>
                    Promise.resolve({ error: "Test error" })
                );

            const req = {
                body: {
                    movieId: 1,
                    like: true,
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

            await VoteController.create(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(400);

            mockCreate.mockClear();
        });

        test("should respond with 500 when service throws error", async () => {
            const mockCreate = jest
                .spyOn(VoteService, "create")
                .mockImplementationOnce(() => {
                    throw new Error("Test error");
                });

            const req = {
                body: {
                    movieId: 1,
                    like: true,
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

            await VoteController.create(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(500);

            mockCreate.mockClear();
        });
    });
});
