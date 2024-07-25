import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // file system of nodejs
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SCREAT,
});

// method for handling file upload on cloudinary
const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
    });


    fs.unlinkSync(filePath); // remove file from locally if its uploaded successfully
    return response;
  } catch (error) {
    // IF uploaded file operation failed then remove the locally saved file
    fs.unlinkSync(filePath);
    return null;
  }
};

export { uploadOnCloudinary };
