import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      lowerCase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary URL
      required: true,
    },
    coverImage: {
      type: String, // cloudinary URL
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Videos",
      },
    ],
    password: {
      type: String, // password must be written encrypted
      required: [true, "Password must be atleast 6 characters long!"],
      trim: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// we don't use arrow function bcoz in this formate arrow fn didn't get a this keyword so we need a this keyword for userSchema ref
userSchema.pre("save", async function (next) {
  // here we create a password only when password field is modified
  if (!this.isModified("password")) return next();

  this.password = bcrypt.hash(this.password, 10); // here 10 is round digit
  next();
});

export const User = mongoose.model("User", userSchema);
