type OperationResult<T> = {
    error?: string;
    data?: T;
};

type MoviesOrder = "date" | "likes" | "hates";

type MoviesSort = "DESC" | "ASC";

interface MoviesPageParams {
    order?: MoviesOrder;
    sort?: MoviesSort;
    page?: number;
    limit?: number;
    creatorId?: number;
}

// Workaround on express generic request types
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ReqParams {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ReqBody {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ResBody {}

export { OperationResult, MoviesPageParams, ReqParams, ReqBody, ResBody };
