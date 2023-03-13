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
}

// Workaround on express generic request types
interface ReqParams {}
interface ReqBody {}
interface ResBody {}

export { OperationResult, MoviesPageParams, ReqParams, ReqBody, ResBody };
