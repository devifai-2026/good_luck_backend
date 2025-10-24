import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { validatePhoneNumber } from "../../utils/validatePhoneNumber.js";

const authSchema = new Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone Number is required"],
      validate: {
        validator: function (v) {
          return validatePhoneNumber(v); // Use the validatePhoneNumber function
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    otp: {
      type: Number,
    },
    otpExpiresAt: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    user_type: {
      type: String, // Use 'String' instead of 'Enum'
      enum: ["astrologer", "affiliate_marketer", "user", "admin"],
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// Method to check if the user is an astrologer
authSchema.methods.isAstrologer = function () {
  return this.user_type === "astrologer";
};

// Method to generate Access Token
authSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      user_type: this.user_type, // Store user type in the token payload
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Method to generate Refresh Token
authSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      user_type: this.user_type, // Store user type in the token payload
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Method to verify OTP
authSchema.methods.verifyOtp = function (enteredOtp) {
  // Check if OTP matches and hasn't expired
  return this.otp === enteredOtp && this.otpExpiresAt > Date.now();
};

// Method to set OTP with expiration
authSchema.methods.setOtp = function (otp, expiryInMinutes = 5) {
  this.otp = otp;
  this.otpExpiresAt = Date.now() + expiryInMinutes * 60 * 1000; // Set expiry time for OTP
};

export const Auth = mongoose.model("Auth", authSchema);
