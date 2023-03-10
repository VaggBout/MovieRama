import * as express from "express";
import * as Homepage from "./controllers/homepage";

const routes = express.Router();
routes.get("/", Homepage.get);

export = routes;
