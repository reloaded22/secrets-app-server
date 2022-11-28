import express from "express";
import session from "express-session";
import passport from "passport";
import { readSecretsMongo, authenticateMongoUser, registerMongoUser, addMongoSecret, updateMongoSecret, deleteMongoSecret } from "./crud/crudFunctions.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

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

// ROUTES ////////////////////////////
const router = express.Router();
app.use("/api", router);

router.get("/home",(req,res)=>{
    readSecretsMongo(req, res);
}); 
//////////////////////////////////////
router.get("/about", (req, res) => {
  res.render("about", {
    loggedIn: req.isAuthenticated(),
  });
}); 
//////////////////////////////////////
router.get("/login",(req, res) => {
  console.log("GET REQUEST TO LOGIN");
  console.log(req.isAuthenticated());
  res.json({
    loggedIn: req.isAuthenticated(),
    loginError: "",
  });
});

router.post("/login", (req, res) => {
  authenticateMongoUser(req, res);
});
//////////////////////////////////////
router.get("/secrets",(req,res)=>{
  readSecretsMongo(req, res, "secrets");
}); 
//////////////////////////////////////
router.post("/register",(req,res)=>{
  registerMongoUser(req, res);
}); 
//////////////////////////////////////
router.get("/logout",(req,res)=>{
  req.logOut((err)=>{
    if (!err) {
      console.log("Successfully logged out\n");
      res.json({
        loggedIn: req.isAuthenticated(),
        loginError: "",
      });
    } else {
      console.log(err);
      res.json({
        loggedIn: req.isAuthenticated(),
        loginError: err,
      });
    };
  });
}); 
//////////////////////////////////////
router.get("/submit",(req,res)=>{
  if (req.isAuthenticated()) {
    res.render("submit", { loggedIn: req.isAuthenticated() });
  } else {
    console.log("User needs to login to see the requested page\n");
    res.redirect("/login");
  };
});

router.post("/submit",(req,res)=>{
  addMongoSecret(req, res);
}); 
//////////////////////////////////////
// I can make this request either with GET or POST
router.get("/delete/:index", (req, res) => {
  deleteMongoSecret(req, res);
});
//////////////////////////////////////
router.post("/submit-update", (req, res)=> {
  updateMongoSecret(req, res);
});
//////////////////////////////////////
router.get("/admin-panel", (req,res) => {

  if (req.isAuthenticated()) {  
      readSecretsMongo(req, res, "admin-panel");
  } else {
    res.redirect("/login");
  }
});

// Server Connection //
const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT} 🚀\n`);
});


///////////////////////////////////////////////////////////
// NOTES & BACKUPS:

//////////////////////////////////////
// I don't need to make requests to "/edit-secret/:index"

/* router.get("/edit-secret/:index", (req, res) => {
  console.log("GET REQUEST TO /edit-secret/:index");
  const index = req.params.index;
  console.log(index);
  if (req.isAuthenticated()) {
    res.json({
      loggedIn: req.isAuthenticated(),
      index: index,
      secret: req.user.secrets[index],
    });
  } else {
    console.log("User needs to login to see the requested page\n");
    res.json({
      loggedIn: req.isAuthenticated(),
      index: index,
    });
  }
});

router.post("/edit-secret/:index", (req, res)=>{
  console.log("POST REQUEST TO /edit-secret/:index");
  const index = req.params.index;
  console.log(index);
  if (req.isAuthenticated()) {
    res.json({
      loggedIn: req.isAuthenticated(),
      index: index,
      secret: req.user.secrets[index],
    });
  } else {
    console.log("User needs to login to see the requested page\n");
    res.json({
      loggedIn: req.isAuthenticated(),
      index: index,
    });
  };
}); */
