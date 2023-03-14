import config from "./utils/config";
import express, { Express } from "express";
import routes from "./routes";
import path from "path";
import { init } from "./models/adapter/postgresAdapter";
import logger from "./utils/logger";
import cookieParser from "cookie-parser";
import { DbConfig } from "./types/db";

const app: Express = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const port = config.port;

app.use(cookieParser());
app.use(express.json());
app.use("/static", express.static("public"));
app.use("/", routes);

app.use("*", function (_req: express.Request, res: express.Response) {
    res.render("404");
});

app.listen(port, () => {
    const dbConfig: DbConfig = {
        host: config.dbHost,
        port: config.dbPort,
        database: config.dbName,
        user: config.dbUser,
        password: config.dbPassword,
    };

    init(dbConfig).then(() =>
        logger.info(`Server is running at http://localhost:${port}`)
    );
});
