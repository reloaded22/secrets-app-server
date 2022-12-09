
import passport from "passport";
import User from "../models/User.js";
import url from "url";

// FUNCTIONS //
/////////////////////////////////////////////////////////////////////

const registerUser = (req, res) => {
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

const authenticateUser = (req, res) => {
    passport.authenticate("local", (err, user, options) => {
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
            res.json({
              user: {},
              loggedIn: req.isAuthenticated(),
              loginError: options.message,
            });
        };
    })(req, res);
};

const logOut = (req, res) => {
  req.logOut((err) => {
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
    }
  });
};

const readSecrets = (req, res) => {
  //console.log(`Authenticated?: ${req.isAuthenticated() ? "YES" : "NO"}`);
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

const addSecret = (req, res) => {
    User.updateOne(
        { _id: req.user._id },
        { $push: { secrets: req.body.secret } },
        (err) => {
            if (err) {
                console.log(err);
            } else {
              console.log("Secret saved successfully\n");
              res.json({ redirect: "/app/my-secrets" });
            };
        }
    ); 
};

const updateSecret = (req, res) => {
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

const deleteSecret = (req, res) => {
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
  } else {
    console.log("User needs to login to see the requested page\n");
    res.json({
      loggedIn: req.isAuthenticated(),
      index: index,
    });
  }
};

export {
  registerUser,
  authenticateUser,
  logOut,
  readSecrets,
  addSecret,
  updateSecret,
  deleteSecret,
  adminUpdate,
  adminDelete,
};