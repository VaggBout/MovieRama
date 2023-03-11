import { Movie } from "../models/movie";
import { OperationResult } from "../types/generic";
import { MovieDto } from "../types/dto";

export async function create(data: MovieDto): Promise<OperationResult<Movie>> {
    const existingMovie = await Movie.findByTitle(data.title);

    if (existingMovie) {
        return {
            error: `Movie with title ${data.title} already exists`,
        };
    }

    const movie = await Movie.create(data);
    if (!movie) {
        return {
            error: "Failed to create movie",
        };
    }

    return { data: movie };
}
