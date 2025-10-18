import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error("MONGODB_URI is not defined in .env file");

    const cleanURI = mongoURI.replace(/\/+$/, "");

    // Register listeners BEFORE connect
    mongoose.connection.on("connected", () => {
      console.log("✅ Mongo DB is connected");
    });
    mongoose.connection.once("open", () => {
      console.log("📡 MongoDB connection is open");
    });
    mongoose.connection.on("error", (err) =>
      console.error("❌ MongoDB error:", err)
    );
    mongoose.connection.on("disconnected", () =>
      console.log("❗ MongoDB disconnected")
    );

    const opts = {};
    if (process.env.MONGODB_DB) opts.dbName = process.env.MONGODB_DB;

    await mongoose.connect(cleanURI, opts);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
