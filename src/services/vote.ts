import { Vote } from "../models/vote";
import { Movie } from "../models/movie";
import { OperationResult } from "../types/generic";
import { VoteDto } from "../types/dto";

export async function create(data: VoteDto): Promise<OperationResult<Vote>> {
    const movie = await Movie.findById(data.movieId);

    if (!movie) {
        return {
            error: "Movie does not exist",
        };
    }

    if (movie.userId === data.userId) {
        return {
            error: "User who submitted the movie can't vote it",
        };
    }

    const vote = await Vote.upsert(data);
    if (!vote) {
        return {
            error: "Failed to create vote",
        };
    }

    return { data: vote };
}

export async function removeVote(
    userId: number,
    movieId: number
): Promise<OperationResult<void>> {
    const entry = await Vote.removeByMovieIdUserId(userId, movieId);

    if (!entry) {
        return {
            error: "Failed to remove vote entry",
        };
    }

    return {};
}
