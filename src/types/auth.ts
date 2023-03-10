type JwtTokenSchema = {
    id: number;
    email: string;
    name: string;
    exp: number;
};

type TokenStatus = {
    decodedToken: JwtTokenSchema | null;
};

export { JwtTokenSchema, TokenStatus };
