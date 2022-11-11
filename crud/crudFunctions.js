import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import mongoDbConnection from "../config/mongoDbConnection.js";
import dotenv from "dotenv";

// Initialize dotenv //
dotenv.config();

// MongoDB Atlas Connection //
mongoDbConnection();

// Create the schema for the model //
const userSchema = new mongoose.Schema({
  alias: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, required: true, default: false },
  secrets: [],
});
// Inject the passport-local-mongoose module to the schema //
userSchema.plugin(passportLocalMongoose);
// Create the model //
const User = new mongoose.model("User", userSchema);
// Use the passport module //
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FUNCTIONS //
/////////////////////////////////////////////////////////////////////
const readSecretsMongo = (req, res) => {
  User.find((err, users) => {
    if (err) {
      console.log(err);
    } else {
      if (users) {
        res.json(users);
      };
    };
  });
};

const authenticateMongoUser = (req, res) => {
    passport.authenticate("local", (err, user, options) => {
        console.log(req.body);
        if (user) {
            req.login(user, (error) => {
                if (error) {
                    res.send(error);
                } else {
                    console.log("Successfully authenticated\n");
                    res.json({
                      loggedIn: req.isAuthenticated(),
                      loginError: "",
                    });
                };
            });
        } else {
            //console.log(options.message);
            res.json({
              loggedIn: req.isAuthenticated(),
              loginError: options.message,
            });
        };
    })(req, res);
};

const registerMongoUser = (req, res) => {
  console.log(req.body);
  const user = {
    username: req.body.username,
    alias: req.body.alias
  };
  User.register(
    user,
    req.body.password,
    (err) => {
      if (!err) {
        console.log("New user saved successfully\n");
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      } else {
        console.log(err.message);
        let regError = "";
        err.message.search("key") != -1
          ? (regError = "Alias already taken, please choose a different one")
          : (regError = "Email already registered");
          res.render("register", {regError});
      };
    }
  );
};

/////////////////////////////////////////////////////////////////////

const addMongoSecret = (req, res) => {
    User.updateOne(
        { _id: req.user._id },
        { $push: { secrets: req.body.secret } },
        (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Secret saved successfully\n");
                res.redirect("/my-secrets");
            };
        }
    ); 
};

const deleteMongoSecret = (req, res) => {
  if (req.isAuthenticated()) {
    const index = req.body.index;
    const oldSecret = req.user.secrets[index];
    console.log(`Secret to be deleted: ${oldSecret}\n`);
    User.updateOne(
      { _id: req.user._id },
      { $pull: { secrets: oldSecret } },
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Secret deleted successfully\n");
          res.redirect("/my-secrets");
        };
      }
    );
  } else {
    res.redirect("/login");
  };
};


const updateMongoSecret = (req, res) => {
    const { index, secret } = req.body;
    const oldSecret = req.user.secrets[index];
        User.updateOne(
        { _id: req.user._id, secrets: oldSecret },
        { $set: { "secrets.$": secret } },
        (err) => {
            if (err) {
            console.log(err);
            } else {
            console.log("Secret updated successfully\n");
            res.redirect("/my-secrets");
            };
        }
    );
};

export {
  readSecretsMongo,
  authenticateMongoUser,
  registerMongoUser,
  addMongoSecret,
  updateMongoSecret,
  deleteMongoSecret,
};