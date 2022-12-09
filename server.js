import express from "express";
import session from "express-session";
import passport from "passport";
import DbConnection from "./config/mongoDbConnection.js";
import { router as userRoutes } from "./routes/userRoutes.js";
import dotenv from "dotenv";

// Initialize dotenv //
dotenv.config();

// MongoDB Atlas Connection //
DbConnection();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the express-session module ////
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
// Initialize passport ///////////////
app.use(passport.initialize());
app.use(passport.session());
//////////////////////////////////////

// Use the routes //
app.use("/api", userRoutes);

// SERVER CONNECTION //
const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT} 🚀\n`);
});
