import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

export const registerUser = asyncHandler(async (req, res) => {
  // get user detail from frontend/request body
  const { username, email, fullName, password } = req.body;

  // validation not single field empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required!");
  }
  // check if user already exists: username or email
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email & username already exists!");
  }

  // check for avatar & cover image
  const avatarLocalPath = req.files?.avatar[0]?.path; // here we can get the path from malter
  const coverImgLocalPath = req.files?.coverImage[0]?.path; // here we can get the path from malter

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image must be required!");
  }

  // upload avatar & cover image to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImg = await uploadOnCloudinary(coverImgLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar image must be required!");
  }

  // create user object - create entry in database
  const newUser = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImg?.url || "",
  });

  // remove password & refresh token field from response
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while user registering the user!"
    );
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully!"));
});
