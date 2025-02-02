import { Schema } from "mongoose";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userschema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {  // Added username field
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
  phonenumber:{
    type: Number,
    required: true,
  },
    // Added address-related fields
    
   
   
   
  },
  { timestamps: true }
);

userschema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userschema.methods.ispasswordcorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userschema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullname: this.fullname,
      email: this.email,
    withdrawpin:this.withdrawpin
    },
    process.env.ACCESS_TOKEN_SECRET,
     { expiresIn: "1h" }
  );
};

// Generate a refresh token
userschema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

export const User = mongoose.model("User", userschema);
