import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: true,
};

// method for generating tokens
export const generateAccessAndRefereshToken = async (userId) => {
  try {
    // find user from DB by using id
    const user = await User.findById(userId);

    // IF user not exist in DB
    if (!user) {
      throw new ApiError(404, "Invalid Credentials");
    }

    // generate access & referesh token using custom model method
    const accessToken = user.generateAccessToken();
    const refereshToken = user.generateRefereshToken();

    // replace refereshTooken in database bcoz initial refereshToken is empty or null
    user.refereshToken = refereshToken;

    // save user again in DB without checking validation
    await user.save({ validateBeforeSave: false });

    // return accessToken & refereshToken
    return { accessToken, refereshToken };
  } catch (error) {
    console.error("Error generating tokens: ", error);
    throw new ApiError(
      500,
      "Something went wrong while generating access & referesh token!"
    );
  }
};

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

export const loginUser = asyncHandler(async (req, res) => {
  // Get values from the frontend/req.body
  const { username, email, password } = req.body;

  // check the username or email is coming in request body or not
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required!");
  }

  // find the user from database via email or username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // if user not exist in DB then throw error
  if (!existedUser) {
    throw new ApiError(404, "No user found with this email or username!");
  }

  // compare entered password with already saved DB password
  const isPasswordValid = await existedUser.isPasswordCorrect(password);

  // if password wrong then throw an error
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials!");
  }

  // Generate access and refreshToken
  const { accessToken, refereshToken } = await generateAccessAndRefereshToken(
    existedUser._id
  );

  // before calling DB again make sure that it is not expensive
  const loggedInUser = await User.findById(existedUser._id).select(
    "-password -refereshToken"
  );

  // send cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refereshToken", refereshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken, // send again just for the purpose of frontend requirements
          refereshToken,
        },
        "User logged in successfully!"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  // delete refereshToken from DB
  await User.findByIdAndUpdate(
    req.user._id, // get user from the requst which we gonna be added using middleware
    {
      $set: { refereshToken: undefined }, // set refereshToken to undefined means empty
    },
    {
      new: true, // store value in DB with new user object where refereshToken is undefined
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refereshToken", options)
    .json(new ApiResponse(200, {}, "User logout successfully!"));
});

export const refereshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefereshToken =
    req.cookies.refereshToken || req.body.refereshToken;

  if (!incomingRefereshToken) {
    throw new ApiError(401, "Unauthorized request!");
  }

  try {
    // verify incoming token with already saved token
    const decodedToken = jwt.verify(
      incomingRefereshToken,
      process.env.REFERESH_TOKEN_SCREACT
    );

    const user = await User.findById(decodedToken?._id);

    // if user not exist
    if (!user) throw new ApiError(401, "Invailed referesh token!");

    // check the incoming token with already saved token
    if (incomingRefereshToken !== user?.refereshToken) {
      throw new ApiError(401, "Referesh token is expired or used!");
    }

    const { accessToken, newRefereshToken } =
      await generateAccessAndRefereshToken(user?._id);

    return res
      .status(200)
      .clearCookie("accessToken", options, accessToken)
      .clearCookie("refereshToken", options, newRefereshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refereshToken: newRefereshToken },
          "Access token refereshed successfully!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // get the user id from request and search it to database
  const user = await User.findById(req?.user?._id);

  // match the current password to old one
  const isCorrectPassword = await user.isPasswordCorrect(oldPassword);

  if (!isCorrectPassword) throw new ApiError(400, "Invalid old password");

  // set new password to current password
  user.password = newPassword;

  // save user into base with the updated data
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password change successfully!"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req?.user, "current user fetching successfly");
});
