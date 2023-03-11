import { describe, expect, jest, test } from "@jest/globals";
import * as UserController from "../../src/controllers/user";
import { User } from "../../src/models/user";
import * as UserService from "../../src/services/user";
import express from "express";

describe("User controller", () => {
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

            await UserController.register(req, res);
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

            await UserController.register(req, res);
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

            await UserController.register(req, res);
            expect(mockRegister).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(500);

            mockRegister.mockClear();
        });
    });

    describe("getRegister", () => {
        test("should render register page", () => {
            const req = {} as express.Request;
            const res = {
                locals: {},
                render: jest.fn().mockImplementationOnce((pageName) => {
                    expect(pageName).toBe("register");
                }),
            } as unknown as express.Response;

            UserController.getRegister(req, res);
        });

        test("should redirect to root page when user is logged in", () => {
            const req = {} as express.Request;
            const res = {
                locals: {
                    user: {
                        id: 1,
                    },
                },
                render: jest.fn().mockImplementationOnce(() => {
                    throw new Error("should not be called!");
                }),
                redirect: jest.fn().mockImplementationOnce((path) => {
                    expect(path).toBe("/");
                }),
            } as unknown as express.Response;

            UserController.getRegister(req, res);
        });
    });

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

            await UserController.login(req, res);
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

            await UserController.login(req, res);
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

            await UserController.login(req, res);
            expect(mockAuth).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(500);
            mockAuth.mockClear();
        });
    });

    describe("getLogin", () => {
        test("should render login page", () => {
            const req = {} as express.Request;
            const res = {
                locals: {},
                render: jest.fn().mockImplementationOnce((pageName) => {
                    expect(pageName).toBe("login");
                }),
            } as unknown as express.Response;

            UserController.getLogin(req, res);
        });

        test("should redirect to root page when user is logged in", () => {
            const req = {} as express.Request;
            const res = {
                locals: {
                    user: {
                        id: 1,
                    },
                },
                render: jest.fn().mockImplementationOnce(() => {
                    throw new Error("should not be called!");
                }),
                redirect: jest.fn().mockImplementationOnce((path) => {
                    expect(path).toBe("/");
                }),
            } as unknown as express.Response;

            UserController.getLogin(req, res);
        });
    });
});
