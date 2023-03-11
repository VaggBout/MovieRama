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

export { UserDto, MovieDto };
