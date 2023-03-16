import * as express from "express";

import * as HomeController from "./controllers/home";
import * as UserController from "./controllers/user";

import * as LoginApiController from "./controllers/api/login";
import * as MovieApiController from "./controllers/api/movies";
import * as RegisterApiController from "./controllers/api/register";
import * as VoteApiController from "./controllers/api/votes";

import * as UserMiddleware from "./middlewares/user";
import * as RegisterMiddleware from "./middlewares/register";
import * as LoginMiddleware from "./middlewares/login";
import * as MovieMiddleware from "./middlewares/movie";
import * as VoteMiddleware from "./middlewares/vote";

const routes = express.Router();
const apiRoutes = express.Router();

routes.use(UserMiddleware.populateAuthUser);
routes.get("/", MovieMiddleware.validateRenderMoviesReq, HomeController.get);
routes.get(
    "/users/:id",
    UserMiddleware.validateUserIdParam,
    MovieMiddleware.validateRenderMoviesReq,
    UserController.get
);
routes.use("/api", apiRoutes);

apiRoutes.post(
    "/register",
    RegisterMiddleware.validateRegisterReq,
    RegisterApiController.post
);

apiRoutes.post(
    "/login",
    LoginMiddleware.validateLoginReq,
    LoginApiController.post
);

apiRoutes.post(
    "/movies",
    MovieMiddleware.validateCreateMovieReq,
    MovieApiController.post
);

apiRoutes.get(
    "/movies",
    MovieMiddleware.validateApiMoviesReq,
    MovieApiController.get
);

apiRoutes.post(
    "/votes",
    VoteMiddleware.validateCreateVoteReq,
    VoteApiController.post
);

apiRoutes.delete(
    "/votes/:id",
    VoteMiddleware.validateRemoveVoteReq,
    VoteApiController.remove
);

export = routes;
