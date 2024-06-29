import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({ path: "/.env" });

connectDB();

/*
const app = express()(async () => {
  try {
    // here we can connect with our database
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);

    // here we can check some listener of express
    app.on("error", (error) => {
      console.log("ERROR: ", error);
      throw error;
    });

    // here we can listen our nodejs app
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR: ", error);
    throw error;
  }
})();
*/
