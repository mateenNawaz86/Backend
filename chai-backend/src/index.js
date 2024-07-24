import { app } from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed! ", err);
  });
