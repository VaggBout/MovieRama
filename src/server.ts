import express, { Express } from "express";
import * as dotenv from "dotenv";
import routes from "./routes";
import path from "path";

dotenv.config({ path: __dirname + "/.env" });

const app: Express = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const port = process.env.PORT ? process.env.PORT : 3000;

app.use("/", routes);

app.listen(port, () => {
    console.log(`[backend]: Server is running at http://localhost:${port}`);
});
