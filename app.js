import express, { json, urlencoded } from "express";
import session from "express-session";
import passport from "passport";
import mongoDbConnection from "./config/mongoDbConnection.js";
import userRouter from "./routes/userRoutes.js";
import dotenv from "dotenv";

// Initialize dotenv //
dotenv.config();

// MongoDB Atlas Connection //
mongoDbConnection();

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

// Use the express-session module ////
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
// Initialize passport ///////////////
app.use(passport.initialize());
app.use(passport.session());
//////////////////////////////////////

// Use the routes //
app.use("/api", userRouter);

// SERVER CONNECTION //
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}\n`);
});
