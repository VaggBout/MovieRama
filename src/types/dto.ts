import { DateTime } from "luxon";

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

interface MovieEntryDto {
    id: number;
    title: string;
    description: string;
    daysElapsed: string;
    userId: number;
    userName: string;
    likes: number;
    hates: number;
    vote: boolean | null;
}

interface VoteDto {
    userId: number;
    movieId: number;
    like: boolean;
}

interface MoviesPageDto {
    movies: Array<MovieEntryDto>;
    totalMovies: number;
}

export { UserDto, MovieDto, MovieEntryDto, MoviesPageDto, VoteDto };
