import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  // get user detail from frontend
  const { username, email, fullName, password } = req.body;
  console.log(username);
  // validation not single field empty
  // check if user already exists: username or email
  // check for avatar & cover image
  // upload avatar & cover image to cloudinary
  // create user object - create entry in database
  // remove password & refresh token field from response
  // check for user creation
  // return response
});
