import { DateTime } from "luxon";
import { MovieCard } from "../models/movieCard";

interface UserDto {
    email: string;
    name: string;
    hash: string;
}

interface MovieDto {
    title: string;
    description: string;
    date: DateTime;
    userId: number;
}

interface VoteDto {
    userId: number;
    movieId: number;
    like: boolean;
}

interface MovieListDto {
    movies: Array<MovieCard>;
    totalMovies: number;
}

export { UserDto, MovieDto, MovieListDto, VoteDto };
