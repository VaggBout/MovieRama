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
}

type MoviesPageDto = Array<MovieEntryDto>;

export { UserDto, MovieDto, MovieEntryDto, MoviesPageDto };
