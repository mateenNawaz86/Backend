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
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email & username already exists!");
  }

  let avatarLocalPath;
  let coverImgLocalPath;
 
  // check avatar & coverImg is coming or not
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files?.avatar[0]?.path; // here we can get the path from malter
  }

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImgLocalPath = req.files?.coverImage[0]?.path; // here we can get the path from malter
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image must be required!");
  }

  // upload avatar & cover image to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImg = await uploadOnCloudinary(coverImgLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar image!");
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
