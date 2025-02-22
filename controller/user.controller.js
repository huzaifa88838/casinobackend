import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../models/user.js";
import { ApiResponse } from "../utils/apiresponse.js";
import crypto from "crypto";
import nodemailer from "nodemailer";


import mongoose from "mongoose"


const generateAccessAndRefereshTokens = async(userId) =>{
  try {
    // Fetch user from the database
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token Generation Error:", error.message);
    throw new ApiError(500, error.message || "Error while generating tokens");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, phonenumber, password, role } = req.body;

  // Validate required fields
  if (![username, fullname, email, phonenumber, password].every(field => field?.trim() !== "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate the role
  if (!["admin", "master", "agent", "user"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  // Check if the email already exists
  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Creating the user without authentication requirement
  const user = await User.create({
    username,
    fullname,
    phonenumber,
    email,
    password,
    role, // Set role as provided
  });

  // Exclude password from response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});




const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is provided
  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  // Find user by username
  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // Validate password
  const isPasswordValid = await user.ispasswordcorrect(password); // Ensure `isPasswordCorrect` is the correct method
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id); // Corrected typo in `generateAccessAndRefereshTokens`

  // Fetch user details without password or refreshToken
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // Cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  };

  // Set cookies and respond with user details and tokens
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});


const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
       httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});
const userStatus = asyncHandler(async (req, res) => {
    // Assuming the user is already authenticated based on access token in cookies
    const userId = req.user._id; // user info should be available via middleware
 
  
    // Find the user by ID
    const user = await User.findById(userId).select("-password -refreshToken");
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Determine the user's status (could be more complex based on application needs)
    const status = user.isActive ? "Active" : "Inactive"; // Example of a basic status check
  
    return res.status(200).json(
      new ApiResponse(200, { user, status }, "User status retrieved successfully")
    );
  });
  // Route: GET /api/users/:userId
const getUserDetails = asyncHandler(async (req, res) => {
    const { userId } = req.params; // Extract user ID from route parameter
  
    // Check if userId is valid
    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }
  
    // Find the user by ID and exclude sensitive fields
    const user = await User.findById(userId).select("-password -refreshToken");
  
    // If the user doesn't exist, return an error
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    return res.status(200).json(
      new ApiResponse(200, user, "User details retrieved successfully")
    );
  });
  // Route: GET /api/users
const getAllUsers = asyncHandler(async (req, res) => {
    // Find all users excluding password and refreshToken fields
    const users = await User.find().select("-password -refreshToken");
  
    // If no users are found, return a message
    if (!users.length) {
      throw new ApiError(404, "No users found");
    }
  
    return res.status(200).json(
      new ApiResponse(200, users, "All users details retrieved successfully")
    );
  });
  const getAllMasters = asyncHandler(async (req, res) => {
    try {
      const masters = await User.find({ role: "master" }).select("-password -refreshToken");
  
      if (!masters.length) {
        throw new ApiError(404, "No masters found");
      }
  
      return res.status(200).json(new ApiResponse(200, masters, "Masters retrieved successfully"));
    } catch (error) {
      throw new ApiError(500, "Something went wrong while fetching masters");
    }
  });
  const getAllagents = asyncHandler(async (req, res) => {
    try {
      const masters = await User.find({ role: "agent" }).select("-password -refreshToken");
  
      if (!masters.length) {
        throw new ApiError(404, "No masters found");
      }
  
      return res.status(200).json(new ApiResponse(200, masters, "Masters retrieved successfully"));
    } catch (error) {
      throw new ApiError(500, "Something went wrong while fetching masters");
    }
  });
    const getAllusers = asyncHandler(async (req, res) => {
    try {
      const masters = await User.find({ role: "user" }).select("-password -refreshToken");
  
      if (!masters.length) {
        throw new ApiError(404, "No masters found");
      }
  
      return res.status(200).json(new ApiResponse(200, masters, "Masters retrieved successfully"));
    } catch (error) {
      throw new ApiError(500, "Something went wrong while fetching masters");
    }
  });
  const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
  
    // Validate email
    if (!email) {
      throw new ApiError(400, "Email is required");
    }
  
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });
  
    // Reset URL (adjust the frontend route accordingly)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>If you did not request this, please ignore this email.</p>`,
    };
  
    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or your preferred email provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json(
        new ApiResponse(
          200,
          null,
          "Password reset email sent successfully"
        )
      );
    } catch (error) {
      console.error("Error sending email:", error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
  
      throw new ApiError(500, "Error sending email. Try again later");
    }
  });
  const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
  
    if (!token || !newPassword) {
      throw new ApiError(400, "Token and new password are required");
    }
  
    // Hash the provided token to compare with the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
    // Find user by the hashed token and ensure token has not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check expiration
    });
  
    if (!user) {
      throw new ApiError(400, "Invalid or expired token");
    }
  
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  
    res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
  });

 
  
  
 
 
  
  // Get a specific withdrawal request

  const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
  
    // Ensure both fields are provided
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Old password and new password are required");
    }
  
    // Find the user based on the authenticated user's ID
    const user = await User.findById(req.user._id);
  
    if (!user) {
      throw new ApiError(404, "User not found");
    }
  
    // Verify the old password
    const isPasswordValid = await user.ispasswordcorrect(oldPassword); // Replace with the correct password validation method
    if (!isPasswordValid) {
      throw new ApiError(401, "Old password is incorrect");
    }
  
    // Update the password
    user.password = newPassword;
    await user.save();
  
    return res.status(200).json(
      new ApiResponse(200, null, "Password changed successfully")
    );
  });
 
 const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate if user ID exists
  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  // Check if the user exists
  const user = await User.findById(id);
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete the user
  await user.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, fullname, email, phonenumber, password, role } = req.body;

  // Check if the user exists
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user details
  user.username = username || user.username;
  user.fullname = fullname || user.fullname;
  user.email = email || user.email;
  user.phonenumber = phonenumber || user.phonenumber;
  if (password) user.password = password;  // Add password handling if needed
  user.role = role || user.role;

  await user.save();

  // Exclude password from the response
  const updatedUser = await User.findById(user._id).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

  
export { registerUser, loginUser, logoutUser,userStatus,getUserDetails,forgotPassword,resetPassword,changePassword,getAllMasters,getAllagents,getAllusers,deleteUser,updateUser };


