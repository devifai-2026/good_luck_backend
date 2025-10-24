import mongoose, { Schema } from "mongoose";
import { validatePhoneNumber } from "../../utils/validatePhoneNumber.js";

const authRequestSchema = new Schema(
  {
    Fname: {
      type: String,
      // required: [true, "First name is required"],
    },
    Lname: {
      type: String,
      // required: [true, "Last name is required"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      // required: [true, "Gender is required"],
    },
    date_of_birth: {
      type: String,
      // required: [true, "DOB is required"],
    },
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
    last_login: {
      type: String,
      validate: {
        validator: function (v) {
          return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(v); // ISO 8601 date format
        },
        message: (props) => `${props.value} is not a valid date format!`,
      },
    },
    services: [String],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isAstrologer: {
      type: Boolean,
    },
    isAffiliate_marketer: {
      type: Boolean,
    },
    isAdmin: {
      type: Boolean,
    },
    otp: {
      type: Number,
    },
    otpExpiresAt: {
      type: Date,
    },
    user_type: {
      type: String,
      enum: ["astrologer", "affiliate_marketer", "user", "admin"],
      required: true,
    },
  },
  { timestamps: true }
);

// Method to verify OTP
authRequestSchema.methods.verifyOtp = function (enteredOtp) {
  // Check if OTP matches and hasn't expired
  return this.otp === enteredOtp && this.otpExpiresAt > Date.now();
};

// Method to set OTP with expiration
authRequestSchema.methods.setOtp = function (otp, expiryInMinutes = 5) {
  this.otp = otp;
  this.otpExpiresAt = Date.now() + expiryInMinutes * 60 * 1000; // Set expiry time for OTP
};

// Export the model
export const AuthRequest = mongoose.model("AuthRequest", authRequestSchema);
