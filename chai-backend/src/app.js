import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { DATA_LIMIT } from "./constants.js";

dotenv.config({ path: ".env" });

const app = express();

// app.use always used for the middleware configration defination
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

// In this middleware we can set the requested json data limit
app.use(express.json({ limit: DATA_LIMIT }));

// In this middleware we can set the URL encoded
app.use(express.urlencoded({ extended: true, limit: DATA_LIMIT }));

// In this configiration we can store the incoming file in the public folder on our server
app.use(express.static("public"));

// In this config we can set the secure cookies in user browser
app.use(cookieParser());

// import routes here
import userRouter from "./routes/user.router.js";

// routes declaration
app.use("/api/users", userRouter);

export { app };
