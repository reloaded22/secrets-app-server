import mongoose from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import mongoDbConnection from "../config/mongoDbConnection.js";
import dotenv from "dotenv";
import url from "url";

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

const registerMongoUser = (req, res) => {
  console.log(req.body);

  const user = {
    username: req.body.username,
    alias: req.body.alias,
  };
  const password = req.body.password;

  User.register(user, password, (err) => {
    let regError = "";
    if (!err) {
      console.log("New user saved successfully\n");
      res.json({ regError: null });
    } else {
      console.log(err.message);
      err.message.search("key") != -1
        ? (regError = "Alias already taken, please choose a different one")
        : (regError = "Email already registered");
      res.json({ regError });
    }
  });
};

const authenticateMongoUser = (req, res) => {
    passport.authenticate("local", (err, user, options) => {
        //console.log(req.body);
        if (user) {
            req.login(user, (error) => {
                if (error) {
                    res.send(error);
                } else {
                    console.log("Successfully authenticated\n");
                    res.json({
                      user: user,
                      loggedIn: req.isAuthenticated(),
                      loginError: "",
                    });
                };
            });
        } else {
            //console.log(options.message);
            res.json({
              user: {},
              loggedIn: req.isAuthenticated(),
              loginError: options.message,
            });
        };
    })(req, res);
};

const readMongoSecrets = (req, res) => {
  console.log(`Authenticated?: ${req.isAuthenticated() ? "YES" : "NO"}`);
  User.find((err, users) => {
    if (err) {
      console.log(err);
    } else {
      if (users) {
        res.json({
          users,
          user: req.isAuthenticated() ? req.user : {},
          loggedIn: req.isAuthenticated(),
        });
      }
    }
  });
};

const addMongoSecret = (req, res) => {
    User.updateOne(
        { _id: req.user._id },
        { $push: { secrets: req.body.secret } },
        (err) => {
            if (err) {
                console.log(err);
            } else {
              console.log("Secret saved successfully\n");
              // res.redirect is relative to the front-end (client)
              // res.redirect("/app/my-secrets"); => Only works with <form method:"POST">
              // For axios, the redirection must be made inside the then() callback
              // So now I can just:
              //res.send()
              // Or send some info like a redirection path
              res.json({ redirect: "/app/my-secrets" });
            };
        }
    ); 
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
            res.json({
              message: err.message
            })
            } else {
            console.log("Secret updated successfully\n");
            res.json({
              message: "Secret updated successfully"
            })
            };
        }
    );
};

const adminUpdate = (req, res) => {
  const { user, secret, index } = req.body;
  const secrets = user.secrets;
  const oldSecret = secrets[index];
  User.updateOne(
    { _id: user._id, secrets: oldSecret },
    { $set: { "secrets.$": secret } },
    (err) => {
      if (err) {
        console.log(err);
        res.json({
          message: err.message,
        });
      } else {
        console.log("Secret updated successfully\n");
        res.json({
          message: "Secret updated successfully",
        });
      }
    }
  );
};

const deleteMongoSecret = (req, res) => {
  const index = req.params.index;
  if (req.isAuthenticated()) {
    const secret = req.user.secrets[index];
    User.updateOne(
      { _id: req.user._id },
      { $pull: { secrets: secret } },
      (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log("Secret deleted successfully\n");
          res.json({
            loggedIn: req.isAuthenticated(),
            index,
            secret,
          });
        }
      }
    );
  } else {
    console.log("User needs to login to see the requested page\n");
    res.json({
      loggedIn: req.isAuthenticated(),
      index: index,
    });
  }
};

const adminDelete = (req, res) => {
  const index = req.params.index;
  const {userid} = url.parse(req.url, true).query;
  console.log("userid:");
  console.log(userid);
  if (req.isAuthenticated()) {
    User.findOne(
      { _id: userid }
    )
      .then((user) => {
        console.log(user);
        const secret = user.secrets[index];
        console.log(secret);
        User.updateOne(
          { _id: userid }, 
          { $pull: { secrets: secret } },
          (err) => {
            if (!err) {
              console.log("Secret deleted successfully\n");
              res.status(200).json({ message: "Success" });
            } else {
              console.error(err);
              res.status(500).json({ error: err });
            };
          }
          );
      })
      // .then(() => {
      //   console.log("Secret deleted successfully\n");
      //   res.send();
      // })
      // .catch((err) => {
      //   res.status(500).json({ error: err });
      // });

    // const secret = req.user.secrets[index];
    // User.updateOne(
    //   { _id: req.user._id },
    //   { $pull: { secrets: secret } },
    //   (err) => {
    //     if (err) {
    //       console.error(err);
    //     } else {
    //       console.log("Secret deleted successfully\n");
    //       res.json({
    //         loggedIn: req.isAuthenticated(),
    //         index,
    //         secret,
    //       });
    //     }
    //   }
    // );
  } else {
    console.log("User needs to login to see the requested page\n");
    res.json({
      loggedIn: req.isAuthenticated(),
      index: index,
    });
  }
};

export {
  registerMongoUser,
  authenticateMongoUser,
  readMongoSecrets,
  addMongoSecret,
  updateMongoSecret,
  deleteMongoSecret,
  adminUpdate,
  adminDelete,
};