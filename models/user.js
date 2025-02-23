import { Schema } from "mongoose";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userschema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "master", "agent", "user"],
      default: "user", // Default role is "user"
    },
    balance: {
      type: Number,
      default: 0, // Initial balance is 0
    },
  },
  { timestamps: true }
);

// Password Hashing Before Saving
userschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password Checking
userschema.methods.ispasswordcorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token (Includes Role)
userschema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullname: this.fullname,
      email: this.email,
      role: this.role, // Adding role to token
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

// Generate Refresh Token
userschema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const User = mongoose.model("User", userschema);
