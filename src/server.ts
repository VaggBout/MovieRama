import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const app: Express = express();

const port = process.env.PORT ? process.env.PORT : 3000;

app.get("/", (_req: Request, res: Response) => {
    res.send("Express Server");
});

app.listen(port, () => {
    console.log(`[backend]: Server is running at http://localhost:${port}`);
});
