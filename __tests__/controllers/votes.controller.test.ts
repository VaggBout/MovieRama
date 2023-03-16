import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import * as VotesController from "../../src/controllers/api/votes";
import { Vote } from "../../src/models/vote";
import * as VoteService from "../../src/services/vote";
import express from "express";

describe("Vote controller", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

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

            await VotesController.post(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
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

            await VotesController.post(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(400);
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

            await VotesController.post(req, res);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(500);
        });
    });

    describe("remove", () => {
        test("should respond ok when vote is deleted", async () => {
            const mockRemoveVote = jest
                .spyOn(VoteService, "removeVote")
                .mockImplementationOnce(() => Promise.resolve({}));

            const req = {
                query: {
                    movieId: 1,
                },
            } as unknown as express.Request;

            const res = {
                send: jest.fn(),
                locals: {
                    user: {
                        id: 1,
                    },
                },
            } as unknown as express.Response;

            await VotesController.remove(req, res);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(mockRemoveVote).toHaveBeenCalledTimes(1);
        });

        test("should respond 400 when vote service returns error", async () => {
            const mockRemoveVote = jest
                .spyOn(VoteService, "removeVote")
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        error: "test-error",
                    })
                );

            const req = {
                query: {
                    movieId: 1,
                },
            } as unknown as express.Request;

            const res = {
                send: jest.fn(),
                locals: {
                    user: {
                        id: 1,
                    },
                },
                statusCode: 0,
            } as unknown as express.Response;

            await VotesController.remove(req, res);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({ error: "test-error" });
            expect(mockRemoveVote).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(400);
        });

        test("should respond 400 when vote service throws error", async () => {
            const mockRemoveVote = jest
                .spyOn(VoteService, "removeVote")
                .mockImplementationOnce(() => {
                    throw new Error("test-error");
                });

            const req = {
                query: {
                    movieId: 1,
                },
            } as unknown as express.Request;

            const res = {
                send: jest.fn(),
                locals: {
                    user: {
                        id: 1,
                    },
                },
                statusCode: 0,
            } as unknown as express.Response;

            await VotesController.remove(req, res);
            expect(res.send).toHaveBeenCalledTimes(1);
            expect(res.send).toHaveBeenCalledWith({
                error: "Something went wrong!",
            });
            expect(mockRemoveVote).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(500);
        });
    });
});
