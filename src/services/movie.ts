import { Movie } from "../models/movie";
import { MovieCard } from "../models/movieCard";
import { OperationResult } from "../types/common";
import { MovieDto, MovieListDto } from "../types/dto";

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

export async function getMoviesList(
    sort: "DESC" | "ASC",
    limit: number,
    offset: number,
    order: "date" | "likes" | "hates",
    userId: number | null,
    creatorId: number | null
): Promise<OperationResult<MovieListDto>> {
    const totalMoviesPromise = Movie.getMoviesCount(creatorId);
    const moviesPagePromise = MovieCard.getMovieCardList(
        sort,
        limit,
        offset,
        order,
        creatorId,
        userId
    );

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
