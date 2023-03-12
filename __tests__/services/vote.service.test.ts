import { describe, expect, jest, test } from "@jest/globals";
import { Vote } from "../../src/models/vote";
import { VoteDto } from "../../src/types/dto";
import * as VoteService from "../../src/services/vote";
import { Movie } from "../../src/models/movie";
import { DateTime } from "luxon";

describe("Vote service", () => {
    describe("create", () => {
        test("should return vote when it is successfully write to DB", async () => {
            const mockFindByUserIdMovieId = jest
                .spyOn(Vote, "findByUserIdMovieId")
                .mockImplementationOnce(() => Promise.resolve(null));

            const mockCreate = jest
                .spyOn(Vote, "create")
                .mockImplementationOnce(() => {
                    const vote = new Vote(1, 1, true);
                    return Promise.resolve(vote);
                });

            const mockFindById = jest
                .spyOn(Movie, "findById")
                .mockImplementationOnce(() => {
                    const movie = new Movie(
                        1,
                        "test",
                        "test desc",
                        2,
                        DateTime.now()
                    );

                    return Promise.resolve(movie);
                });

            const voteDto: VoteDto = {
                userId: 1,
                movieId: 1,
                like: true,
            };

            const result = await VoteService.create(voteDto);
            expect(result.error).toBeUndefined();
            expect(result.data).toBeDefined();
            expect(result.data?.movieId).toBe(1);

            expect(mockFindByUserIdMovieId).toHaveBeenCalledTimes(1);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(mockFindById).toHaveBeenCalledTimes(1);

            mockFindByUserIdMovieId.mockClear();
            mockCreate.mockClear();
            mockFindById.mockClear();
        });

        test("should return error when user has already voted", async () => {
            const mockCreate = jest
                .spyOn(Vote, "findByUserIdMovieId")
                .mockImplementationOnce(() => {
                    const vote = new Vote(1, 1, true);
                    return Promise.resolve(vote);
                });

            const mockFindById = jest
                .spyOn(Movie, "findById")
                .mockImplementationOnce(() => {
                    const movie = new Movie(
                        1,
                        "test",
                        "test desc",
                        2,
                        DateTime.now()
                    );

                    return Promise.resolve(movie);
                });

            const voteDto: VoteDto = {
                userId: 1,
                movieId: 1,
                like: true,
            };

            const result = await VoteService.create(voteDto);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                `User with id ${voteDto.userId} has already voted movie with id ${voteDto.movieId}`
            );

            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(mockFindById).toHaveBeenCalledTimes(1);

            mockCreate.mockClear();
            mockFindById.mockClear();
        });

        test("should return error when vote fails to be saved on DB", async () => {
            const mockFindByUserIdMovieId = jest
                .spyOn(Vote, "findByUserIdMovieId")
                .mockImplementationOnce(() => Promise.resolve(null));

            const mockCreate = jest
                .spyOn(Vote, "create")
                .mockImplementationOnce(() => Promise.resolve(null));

            const mockFindById = jest
                .spyOn(Movie, "findById")
                .mockImplementationOnce(() => {
                    const movie = new Movie(
                        1,
                        "test",
                        "test desc",
                        2,
                        DateTime.now()
                    );

                    return Promise.resolve(movie);
                });

            const voteDto: VoteDto = {
                userId: 1,
                movieId: 1,
                like: true,
            };

            const result = await VoteService.create(voteDto);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe("Failed to create vote");

            expect(mockFindByUserIdMovieId).toHaveBeenCalledTimes(1);
            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(mockFindById).toHaveBeenCalledTimes(1);

            mockFindByUserIdMovieId.mockClear();
            mockCreate.mockClear();
            mockFindById.mockClear();
        });

        test("should return error when the user who submitted a movie tries to vote it", async () => {
            const mockFindById = jest
                .spyOn(Movie, "findById")
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

            const voteDto: VoteDto = {
                userId: 1,
                movieId: 1,
                like: true,
            };

            const result = await VoteService.create(voteDto);
            expect(result.data).toBeUndefined();
            expect(result.error).toBe(
                "User who submitted the movie can't vote it"
            );

            expect(mockFindById).toHaveBeenCalledTimes(1);
            mockFindById.mockClear();
        });
    });
});
