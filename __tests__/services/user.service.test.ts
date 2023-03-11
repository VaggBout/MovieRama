import { describe, expect, jest, test } from "@jest/globals";
import { User } from "../../src/models/user";
import { UserDto } from "../../src/types/dto";
import * as UserService from "../../src/services/user";
import * as bcrypt from "bcrypt";

describe("User service", () => {
    describe("register", () => {
        test("should return user when user is written to DB", async () => {
            const mockFindByEmail = jest
                .spyOn(User, "findByEmail")
                .mockImplementationOnce(() => Promise.resolve(null));

            const mockCreate = jest
                .spyOn(User, "create")
                .mockImplementationOnce(() => {
                    const user = new User(
                        1,
                        "test@email.com",
                        "test name",
                        "hash"
                    );
                    return Promise.resolve(user);
                });

            const userDto: UserDto = {
                name: "test name",
                email: "test@email.com",
                hash: "password",
            };

            const result = await UserService.register(userDto);

            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data?.email).toBe("test@email.com");

            expect(mockFindByEmail).toHaveBeenCalledTimes(1);
            expect(mockCreate).toHaveBeenCalledTimes(1);

            mockFindByEmail.mockClear();
            mockCreate.mockClear();
        });

        test("should return error when provided email already exists", async () => {
            const mockFindByEmail = jest
                .spyOn(User, "findByEmail")
                .mockImplementationOnce(() => {
                    const user = new User(
                        1,
                        "test@email.com",
                        "test name",
                        "hash"
                    );
                    return Promise.resolve(user);
                });

            const userDto: UserDto = {
                name: "test name",
                email: "test@email.com",
                hash: "password",
            };

            const result = await UserService.register(userDto);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                "User with email test@email.com already exists"
            );
            expect(mockFindByEmail).toHaveBeenCalledTimes(1);

            mockFindByEmail.mockClear();
        });

        test("should return error when user fails to be saved on DB", async () => {
            const mockFindByEmail = jest
                .spyOn(User, "findByEmail")
                .mockImplementationOnce(() => Promise.resolve(null));

            const mockCreate = jest
                .spyOn(User, "create")
                .mockImplementationOnce(() => Promise.resolve(null));

            const userDto: UserDto = {
                name: "test name",
                email: "test@email.com",
                hash: "password",
            };

            const result = await UserService.register(userDto);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Failed to create user");

            expect(mockFindByEmail).toHaveBeenCalledTimes(1);
            expect(mockCreate).toHaveBeenCalledTimes(1);

            mockFindByEmail.mockClear();
            mockCreate.mockClear();
        });
    });

    describe("auth", () => {
        test("should return user object when credentials are valie", async () => {
            const saltRounds = 10;
            const email = "test@email.com";
            const password = "password";
            const hash = await bcrypt.hash(password, saltRounds);

            const mockFindByEmail = jest
                .spyOn(User, "findByEmail")
                .mockImplementationOnce(() => {
                    const user = new User(
                        1,
                        "test@email.com",
                        "test name",
                        hash
                    );
                    return Promise.resolve(user);
                });

            const result = await UserService.auth(email, password);
            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data?.email).toBe("test@email.com");
            expect(mockFindByEmail).toHaveBeenCalledTimes(1);

            mockFindByEmail.mockClear();
        });

        test("should return error when user does not exist", async () => {
            const email = "test@email.com";
            const password = "password";

            const mockFindByEmail = jest
                .spyOn(User, "findByEmail")
                .mockImplementationOnce(() => Promise.resolve(null));

            const result = await UserService.auth(email, password);
            expect(result.data).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error).toBe("Invalid credentials");

            expect(mockFindByEmail).toHaveBeenCalledTimes(1);

            mockFindByEmail.mockClear();
        });

        test("should return error when password hash does not match", async () => {
            const email = "test@email.com";
            const password = "password";
            const hash = "invalid-hash";

            const mockFindByEmail = jest
                .spyOn(User, "findByEmail")
                .mockImplementationOnce(() => {
                    const user = new User(
                        1,
                        "test@email.com",
                        "test name",
                        hash
                    );
                    return Promise.resolve(user);
                });

            const result = await UserService.auth(email, password);
            expect(result.data).toBeUndefined();
            expect(result.error).toBeDefined();
            expect(result.error).toBe("Invalid credentials");

            expect(mockFindByEmail).toHaveBeenCalledTimes(1);

            mockFindByEmail.mockClear();
        });
    });

    describe("validate token", () => {
        test("should return decoded token when jwt is valid", async () => {
            const user = new User(1, "test@email.com", "test name", "hash");
            const jwt = UserService.generateAuthToken(user);
            const result = UserService.validateToken(jwt);

            expect(result.decodedToken).not.toBeNull();
            expect(result.decodedToken?.email).toBe("test@email.com");
        });

        test("should return null when token is invalid", async () => {
            const invalidJwt = "invalid-token";

            const result = UserService.validateToken(invalidJwt);
            expect(result.decodedToken).toBeNull();
        });
    });
});
