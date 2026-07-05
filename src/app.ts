import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import config from "./config";

const app = express();

app.use(
  cors({
    origin: config.app_url,
  }),
);
app.use(express.json());
app.use(express.text());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(cookieParser());

export default app;
