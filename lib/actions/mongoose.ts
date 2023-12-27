//npm install mongoose@latest
import mongoose from "mongoose";

let isConnected = false; //connection status

const connectToDB = async () => {
  mongoose.set("strictQuery", true); //prevent unknown field query

  if (!process.env.MONGODB_URI) return console.log("MONGO_URI is not defined");

  if (isConnected) return console.log("Using existing DB connection");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected!");
  } catch (error) {
    console.log("eeeeeeeeeee=" + error);
  }
};

export { connectToDB };
