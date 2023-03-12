import * as express from "express";

import * as HomepageController from "./controllers/homepage";

import * as LoginApiController from "./controllers/api/login";
import * as MovieApiController from "./controllers/api/movie";
import * as RegisterApiController from "./controllers/api/register";
import * as VoteApiController from "./controllers/api/vote";

import * as UserMiddleware from "./middlewares/user";
import * as RegisterMiddleware from "./middlewares/register";
import * as LoginMiddleware from "./middlewares/login";
import * as MovieMiddleware from "./middlewares/movie";
import * as VoteMiddleware from "./middlewares/vote";

const routes = express.Router();
const apiRoutes = express.Router();

routes.use(UserMiddleware.populateAuthUser);
routes.get("/", HomepageController.get);
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
    "/movie",
    MovieMiddleware.validateCreateMovieReq,
    MovieApiController.post
);

apiRoutes.post(
    "/vote",
    VoteMiddleware.validateCreateVoteReq,
    VoteApiController.post
);

apiRoutes.delete(
    "/vote/:id",
    VoteMiddleware.validateRemoveVoteReq,
    VoteApiController.remove
);

export = routes;
