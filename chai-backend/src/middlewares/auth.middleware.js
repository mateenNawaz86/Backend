import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // req have access of all cookies
    const token =
      req.cookies?.accessToken ||
      // this is just for the mobile app bcoz with didn't set cookies in mobile app
      req.header("Authorization")?.replace("Bearer ", "");

    // IF token didn't get
    if (token) {
      throw new ApiError(401, "Unauthorized request!");
    }

    // verify token using JWT
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SCREAT);

    // check the user with this token from database
    const user = await User.findById(decodedToken?._id).select(
      "accessToken -refereshToken"
    );

    // IF user not exist
    if (!user) {
      // TODO: discuss about frontend
      throw new ApiError(401, "Invalid Access Token!");
    }

    // add new object in the existed request body
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token!");
  }
});
