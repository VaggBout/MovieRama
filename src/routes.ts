import * as express from "express";
import * as Homepage from "./controllers/homepage";
import * as User from "./controllers/user";
import * as UserMiddleware from "./middlewares/user";

const routes = express.Router();
routes.get("/", Homepage.get);

routes.get("/register", User.getRegister);
routes.post("/register", UserMiddleware.validateRegisterReq, User.register);

export = routes;
