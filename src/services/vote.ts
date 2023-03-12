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
