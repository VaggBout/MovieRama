import express, { Express } from "express";
import * as dotenv from "dotenv";
import routes from "./routes";
import path from "path";
import { init } from "./models/adapter/postgresAdapter";
import logger from "./utils/logger";
import cookieParser from "cookie-parser";
import { dbConfig } from "./types/db";

dotenv.config();

const app: Express = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const port = process.env.PORT ? process.env.PORT : 3000;

app.use(cookieParser());
app.use(express.json());
app.use("/", routes);

app.use("/static", express.static("public"));

app.listen(port, () => {
    const config: dbConfig = {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
        database: process.env.DB_NAME || "",
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
    };

    init(config).then(() =>
        logger.info(`Server is running at http://localhost:${port}`)
    );
});
