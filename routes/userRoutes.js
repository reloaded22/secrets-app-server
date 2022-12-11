import express from "express";
import { readSecrets, authenticateUser, registerUser, logOut, addSecret, updateSecret, deleteSecret, adminUpdate, adminDelete } from "../controllers/userControllers.js";
const userRouter = express.Router();

// ROUTES ////////////////////////////
userRouter.get("/", (req, res) => {
  res.send("THIS IS A TEST");
});

userRouter.get("/home", readSecrets); 

userRouter.post("/login", authenticateUser);

userRouter.get("/test-login", (req, res) => {
  // res.writeHead(200, { "Content-Type": "text/html" }); !Only with res.end()
  res.send(
    `<div>
    <p>Test Login<p>
    <form action="/api/login" method="post">
      <input type="text" name="username">
      <input type="password" name="password">
      <input type="submit">
    </form>
    </div>`
    );
});

userRouter.post("/register", registerUser); 

userRouter.get("/logout", logOut); 

userRouter.post("/submit", addSecret); 

userRouter.get("/delete/:index", deleteSecret);

userRouter.post("/submit-update", updateSecret);

userRouter.get("/admin-delete/:index", adminDelete);

userRouter.post("/admin-update", adminUpdate);
//////////////////////////////////////

export default userRouter;