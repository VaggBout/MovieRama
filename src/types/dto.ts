interface UserDto {
    email: string;
    name: string;
    hash: string;
}

interface MovieDto {
    title: string;
    description: string;
    date: number;
    userId: number;
}

export { UserDto, MovieDto };
