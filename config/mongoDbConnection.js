import mongoose from "mongoose";

mongoose.set("strictQuery", false);

// MongoDB Atlas Connection //
const mongoDbConnection = () => {
  try {
    mongoose.connect(process.env.MONGO_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB connected successfully")
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  };
};

export default mongoDbConnection;