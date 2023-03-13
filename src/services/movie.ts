import { Movie } from "../models/movie";
import { OperationResult } from "../types/common";
import { MovieDto, MovieEntryDto, MoviesPageDto } from "../types/dto";

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
    sort: "DESC" | "ASC",
    limit: number,
    offset: number,
    order: "date" | "likes" | "hates",
    userId: number | null,
    creatorId: number | null
): Promise<OperationResult<MoviesPageDto>> {
    const totalMoviesPromise = Movie.getMoviesCount(creatorId);
    let moviesPagePromise: Promise<Array<MovieEntryDto>>;

    if (userId) {
        moviesPagePromise = Movie.getMoviesPageLoggedIn(
            sort,
            limit,
            offset,
            userId,
            order,
            creatorId
        );
    } else {
        moviesPagePromise = Movie.getMoviesPage(
            sort,
            limit,
            offset,
            order,
            creatorId
        );
    }

    const [totalMovies, movies] = await Promise.all([
        totalMoviesPromise,
        moviesPagePromise,
    ]);

    return {
        data: {
            totalMovies,
            movies,
        },
    };
}
