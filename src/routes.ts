import * as express from "express";

import * as HomepageController from "./controllers/homepage";
import * as UserController from "./controllers/user";
import * as MovieController from "./controllers/movie";

import * as UserMiddleware from "./middlewares/user";
import * as MovieMiddleware from "./middlewares/movie";

const routes = express.Router();
routes.use(UserMiddleware.populateAuthUser);

routes.get("/", HomepageController.get);

routes.get("/register", UserController.getRegister);
routes.post(
    "/register",
    UserMiddleware.validateRegisterReq,
    UserController.register
);

routes.get("/login", UserController.getLogin);
routes.post("/login", UserMiddleware.validateLoginReq, UserController.login);

routes.post(
    "/movie",
    MovieMiddleware.validateCreateMovieReq,
    MovieController.create
);

export = routes;
