import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    console.log("Cookies:", req.cookies);
    const token = req.cookies.accessToken// Get token after 'Bearer '


console.log("Extracted Token:", token);

if (!token) {
  throw new ApiError(407, "Unauthorized request");
}
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log("Decoded Token:", decodedToken);  // Log the decoded token to check if it's valid

    // Find the user in the database
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    console.log("User Retrieved:", user);  // Log the user to debug

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);  // Log the error message for debugging
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
