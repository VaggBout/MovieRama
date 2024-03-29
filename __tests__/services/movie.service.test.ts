import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Movie } from "../../src/models/movie";
import { MovieDto } from "../../src/types/dto";
import * as MovieService from "../../src/services/movie";
import { DateTime } from "luxon";
import { MovieCard } from "../../src/models/movieCard";

describe("Movie service", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

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
        });
    });

    describe("Get movies list", () => {
        test("should return movies list", async () => {
            const mockGetMovieCardList = jest
                .spyOn(MovieCard, "getMovieCardList")
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
                            date: DateTime.now(),
                        },
                    ]);
                });

            const mockGetMoviesCount = jest
                .spyOn(Movie, "getMoviesCount")
                .mockImplementationOnce(() => Promise.resolve(1));

            const result = await MovieService.getMoviesList(
                "DESC",
                1,
                0,
                "date",
                1,
                null
            );
            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data?.totalMovies).toBe(1);
            expect(result.data?.movies.length).toBe(1);

            expect(mockGetMovieCardList).toHaveBeenCalledTimes(1);
            expect(mockGetMoviesCount).toHaveBeenCalledTimes(1);
        });
    });
});
