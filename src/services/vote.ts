import { Vote } from "../models/vote";
import { OperationResult } from "../types/generic";
import { VoteDto } from "../types/dto";

export async function create(data: VoteDto): Promise<OperationResult<Vote>> {
    const existingVote = await Vote.findByUserIdMovieId(
        data.userId,
        data.movieId
    );

    if (existingVote) {
        return {
            error: `User with id ${data.userId} has already voted movie with id ${data.movieId}`,
        };
    }

    const vote = await Vote.create(data);
    if (!vote) {
        return {
            error: "Failed to create vote",
        };
    }

    return { data: vote };
}
