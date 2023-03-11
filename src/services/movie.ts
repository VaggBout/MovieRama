import { Movie } from "../models/movie";
import { OperationResult } from "../types/generic";
import { MovieDto, MoviesPageDto } from "../types/dto";

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

export async function getMoviesPage(
    sort: "DESC" | "ASC" = "DESC",
    limit: number = 5,
    offset: number = 0
): Promise<OperationResult<MoviesPageDto>> {
    const data = await Movie.getMoviesPage(sort, limit, offset);

    return {
        data,
    };
}
