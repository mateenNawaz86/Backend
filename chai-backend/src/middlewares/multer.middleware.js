import multer from "multer";


// Middleware for handling file upload to cloudinary
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // this is used to generate random string and attach with each uploaded file
    // cb(null, file.fieldname + "-" + uniqueSuffix);


    cb(null, file.originalname); // here we can only get the orignal name of file that's not a good practice but we change this later
  },
});

export const upload = multer({ storage }); // es6 version
