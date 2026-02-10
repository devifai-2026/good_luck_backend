import mongoose, { Schema } from "mongoose";
import walletSchema from "../wallet/wallet.model.js";
import { validatePhoneNumber } from "../../utils/validatePhoneNumber.js";
import reviewSchema from "./review.model.js";

const astrologerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    socketId: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
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
      required: false,
    },
    reviews: [reviewSchema],
    total_number_service_provide: {
      type: Number,
      default: 0,
    },
    total_earning: {
      type: Number,
      default: 0,
    },
    wallet: {
      type: walletSchema,
      default: () => ({ balance: 0, transactionHistory: [] }),
    },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
    chat_price: {
      type: Number,
      required: false,
    },
    video_price: {
      type: Number,
      required: false,
    },
    call_price: {
      type: Number,
      default: 200,
    },
    years_of_experience: {
      type: Number,
      required: false,
    },
    profile_picture: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    language: {
      type: [String],
      required: false,
    },
    certifications: {
      type: [String],
      required: false,
    },
    adhar_card: [String],
    pan_card: [String],
    promo_code: {
      type: Number,
    },
    oneSignalPlayerId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Astrologer = mongoose.model("Astrologer", astrologerSchema);
