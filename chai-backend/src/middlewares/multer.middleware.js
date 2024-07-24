import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the temp directory exists
const tempDir = path.resolve("./public/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Middleware for handling file upload to cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // this is used to generate random string and attach with each uploaded file
    // cb(null, file.fieldname + "-" + uniqueSuffix);


    cb(null, file.originalname); // here we can only get the orignal name of file that's not a good practice but we change this later
  },
});

export const upload = multer({ storage }); // es6 version


