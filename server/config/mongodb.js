import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to DB");
  });

  await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`, {});
};

export default connectDB;
