import { Auth } from "../models/auth/auth.model.js";
import { User } from "../models/auth/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();
    if (!token) {
      console.error("Token missing in request");
      throw new ApiError(401, "Unauthorized Request");
    }
    console.log("Received token:", token);

    // Verify the access token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded token:", decodedToken);

    if (!decodedToken || !decodedToken._id) {
      throw new ApiError(401, "Invalid access token");
    }

    // Find the corresponding auth record by the _id in the token payload
    const authRecord = await Auth.findById(decodedToken._id);
    if (!authRecord) {
      throw new ApiError(401, "Auth record not found");
    }

    // Fetch the associated User using the reference in the Auth record
    const user = await User.findOne({ userId: authRecord._id }).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // Attach user details to the request object for later use
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in verifyJWT middleware:", error.message); // Log the exact error message
    throw new ApiError(401, "Invalid access token");
  }
});
