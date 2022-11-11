import mongoose from "mongoose";

// Create the schema for the model //
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secrets: [],
});
// Inject the passport-local-mongoose module to the schema //
userSchema.plugin(passportLocalMongoose);
// Create the model //
const User = new mongoose.model("User", userSchema);

export default User;