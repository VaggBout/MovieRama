import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Movie } from "../../src/models/movie";
import { MovieDto } from "../../src/types/dto";
import * as MovieService from "../../src/services/movie";
import { DateTime } from "luxon";

describe("Movie service", () => {
    describe("create", () => {
        test("should return movie when it is successfully write to DB", async () => {
            const mockFindByTitle = jest
                .spyOn(Movie, "findByTitle")
                .mockImplementationOnce(() => Promise.resolve(null));

            const mockCreate = jest
                .spyOn(Movie, "create")
                .mockImplementationOnce(() => {
                    const movie = new Movie(
                        1,
                        "test",
                        "test desc",
                        1,
                        DateTime.now()
                    );
                    return Promise.resolve(movie);
                });

            const movieDto: MovieDto = {
                title: "test",
                description: "test desc",
                userId: 1,
                date: DateTime.now(),
            };

            const result = await MovieService.create(movieDto);
            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data?.title).toBe("test");

            expect(mockFindByTitle).toHaveBeenCalledTimes(1);
            expect(mockCreate).toHaveBeenCalledTimes(1);

            mockFindByTitle.mockClear();
            mockCreate.mockClear();
        });

        test("should return error when provided title already exists", async () => {
            const mockCreate = jest
                .spyOn(Movie, "findByTitle")
                .mockImplementationOnce(() => {
                    const movie = new Movie(
                        1,
                        "test",
                        "test desc",
                        1,
                        DateTime.now()
                    );
                    return Promise.resolve(movie);
                });

            const movieDto: MovieDto = {
                title: "test",
                description: "test desc",
                userId: 1,
                date: DateTime.now(),
            };

            const result = await MovieService.create(movieDto);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                `Movie with title ${movieDto.title} already exists`
            );
            expect(mockCreate).toHaveBeenCalledTimes(1);
            mockCreate.mockClear();
        });

        test("should return error when movie fails to be saved on DB", async () => {
            const mockFindByTitle = jest
                .spyOn(Movie, "findByTitle")
                .mockImplementationOnce(() => Promise.resolve(null));

            const mockCreate = jest
                .spyOn(Movie, "create")
                .mockImplementationOnce(() => {
                    return Promise.resolve(null);
                });

            const movieDto: MovieDto = {
                title: "test",
                description: "test desc",
                userId: 1,
                date: DateTime.now(),
            };

            const result = await MovieService.create(movieDto);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Failed to create movie");

            expect(mockFindByTitle).toHaveBeenCalledTimes(1);
            expect(mockCreate).toHaveBeenCalledTimes(1);

            mockFindByTitle.mockClear();
            mockCreate.mockClear();
        });
    });

    describe("Get movies page", () => {
        beforeEach(() => {
            jest.restoreAllMocks();
            jest.clearAllMocks();
        });

        test("should return movies list with user vote when userId is provided", async () => {
            const mockGetMoviesPageLoggedIn = jest
                .spyOn(Movie, "getMoviesPageLoggedIn")
                .mockImplementationOnce(() => {
                    return Promise.resolve([
                        {
                            id: 1,
                            title: "test",
                            description: "test",
                            daysElapsed: "test",
                            userId: 1,
                            userName: "test",
                            likes: 1,
                            hates: 9,
                            vote: true,
                        },
                    ]);
                });

            const mockGetMoviesPage = jest
                .spyOn(Movie, "getMoviesPage")
                .mockImplementationOnce(() => {
                    throw new Error("Should not be called");
                });

            const result = await MovieService.getMoviesPage(
                "DESC",
                1,
                0,
                "date",
                1
            );
            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data?.length).toBe(1);

            expect(mockGetMoviesPageLoggedIn).toHaveBeenCalledTimes(1);
            expect(mockGetMoviesPage).not.toHaveBeenCalled();

            mockGetMoviesPageLoggedIn.mockClear();
            mockGetMoviesPage.mockClear();
        });

        test("should return movies list without user vote when userId is null", async () => {
            const mockGetMoviesPageLoggedIn = jest
                .spyOn(Movie, "getMoviesPageLoggedIn")
                .mockImplementationOnce(() => {
                    throw new Error("Should not be called");
                });

            const mockGetMoviesPage = jest
                .spyOn(Movie, "getMoviesPage")
                .mockImplementationOnce(() => {
                    return Promise.resolve([
                        {
                            id: 1,
                            title: "test",
                            description: "test",
                            daysElapsed: "test",
                            userId: 1,
                            userName: "test",
                            likes: 1,
                            hates: 9,
                            vote: null,
                        },
                    ]);
                });

            const result = await MovieService.getMoviesPage(
                "DESC",
                1,
                0,
                "date",
                null
            );
            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data?.length).toBe(1);

            expect(mockGetMoviesPageLoggedIn).not.toHaveBeenCalled();
            expect(mockGetMoviesPage).toHaveBeenCalledTimes(1);

            mockGetMoviesPageLoggedIn.mockClear();
            mockGetMoviesPage.mockClear();
        });
    });
});
