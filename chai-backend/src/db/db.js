import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"
import dotenv from "dotenv";

dotenv.config({ path: ".env" });


const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      `\n MONGO connected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("ERROR", error);
    throw error;
  }
};

export default connectDB;
