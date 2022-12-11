import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import passport from "passport";

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
const User = new mongoose.model("user", userSchema);
// Use the passport module //
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

export default User;