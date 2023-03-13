import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { Vote } from "../../src/models/vote";
import { VoteDto } from "../../src/types/dto";
import * as VoteService from "../../src/services/vote";
import { Movie } from "../../src/models/movie";
import { DateTime } from "luxon";

describe("Vote service", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should return vote when it is successfully write to DB", async () => {
            const mockCreate = jest
                .spyOn(Vote, "upsert")
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

            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(mockFindById).toHaveBeenCalledTimes(1);
        });

        test("should return error when vote fails to be saved on DB", async () => {
            const mockCreate = jest
                .spyOn(Vote, "upsert")
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

            expect(mockCreate).toHaveBeenCalledTimes(1);
            expect(mockFindById).toHaveBeenCalledTimes(1);
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
        });
    });

    describe("remove vote", () => {
        test("should return when vote is removed", async () => {
            const mockRemoveByMovieIdUserId = jest
                .spyOn(Vote, "removeByMovieIdUserId")
                .mockImplementationOnce(() => Promise.resolve(true));

            const result = await VoteService.removeVote(1, 1);
            expect(result.error).toBeUndefined();
            expect(mockRemoveByMovieIdUserId).toHaveBeenCalledTimes(1);
        });

        test("should return error when vote fails to be removed", async () => {
            const mockRemoveByMovieIdUserId = jest
                .spyOn(Vote, "removeByMovieIdUserId")
                .mockImplementationOnce(() => Promise.resolve(false));

            const result = await VoteService.removeVote(1, 1);
            expect(result.error).toBe("Failed to remove vote entry");
            expect(mockRemoveByMovieIdUserId).toHaveBeenCalledTimes(1);
        });
    });
});
