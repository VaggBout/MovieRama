import express, { Express } from "express";
import * as dotenv from "dotenv";
import routes from "./routes";
import path from "path";
import { init } from "./models/adapter/postgresAdapter";
import logger from "./utils/logger";

dotenv.config();

const app: Express = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const port = process.env.PORT ? process.env.PORT : 3000;

app.use(express.json());
app.use("/", routes);

app.listen(port, () => {
    init().then(() =>
        logger.info(`Server is running at http://localhost:${port}`)
    );
});
