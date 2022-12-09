import express from "express";
import { readSecrets, authenticateUser, registerUser, logOut, addSecret, updateSecret, deleteSecret, adminUpdate, adminDelete } from "../controllers/userControllers.js";
const router = express.Router();

// ROUTES ////////////////////////////
router.get("/home", readSecrets); 

router.post("/login", authenticateUser);

router.post("/register", registerUser); 

router.get("/logout", logOut); 

router.post("/submit", addSecret); 

router.get("/delete/:index", deleteSecret);

router.post("/submit-update", updateSecret);

router.get("/admin-delete/:index", adminDelete);

router.post("/admin-update", adminUpdate);
//////////////////////////////////////

export { router };