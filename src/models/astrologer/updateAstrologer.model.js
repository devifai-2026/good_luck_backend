import mongoose, { Schema } from "mongoose";
import { validatePhoneNumber } from "../../utils/validatePhoneNumber.js";

// Schema for Astrologer Profile Update Request
const updateRequestAstrologerProfileSchema = new Schema(
  {
    Fname: {
      type: String,
    },
    Lname: {
      type: String,
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
    specialisation: {
      type: [{ type: Schema.Types.ObjectId, ref: "AstrologerCategory" }],
      required: [true, "Specialisation is required"],
    },
    chat_price: {
      type: Number,
      required: [true, "Chat price is required"],
    },
    video_price: {
      type: Number,
      required: [true, "Video price is required"],
    },
    call_price: {
      type: Number,
      default: 200,
    },
    years_of_experience: {
      type: Number,
      required: [true, "Years of experience is required"],
    },
    profile_picture: {
      type: String,
      required: [true, "Profile picture is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    language: {
      type: [String],
      required: [true, "Language is required"],
    },
    certifications: {
      type: [String],
      required: [true, "Certifications are required"],
    },
    adhar_card: [String],
    pan_card: [String],
    promo_code: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Method to verify OTP
updateRequestAstrologerProfileSchema.methods.verifyOtp = function (enteredOtp) {
  return this.otp === enteredOtp && this.otpExpiresAt > Date.now();
};

// Method to set OTP with expiration
updateRequestAstrologerProfileSchema.methods.setOtp = function (
  otp,
  expiryInMinutes = 5
) {
  this.otp = otp;
  this.otpExpiresAt = Date.now() + expiryInMinutes * 60 * 1000; // Set expiry time for OTP
};

export const UpdateAstrologerProfile = mongoose.model(
  "UpdateAstrologerProfile",
  updateRequestAstrologerProfileSchema
);
