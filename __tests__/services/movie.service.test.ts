import { describe, expect, jest, test } from "@jest/globals";
import { Movie } from "../../src/models/movie";
import { MovieDto } from "../../src/types/dto";
import * as MovieService from "../../src/services/movie";

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
                        Date.now() / 1000
                    );
                    return Promise.resolve(movie);
                });

            const movieDto: MovieDto = {
                title: "test",
                description: "test desc",
                userId: 1,
                date: Date.now() / 1000,
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
                        Date.now() / 1000
                    );
                    return Promise.resolve(movie);
                });

            const movieDto: MovieDto = {
                title: "test",
                description: "test desc",
                userId: 1,
                date: Date.now() / 1000,
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
                date: Date.now() / 1000,
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
});
