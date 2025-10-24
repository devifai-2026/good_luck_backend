import mongoose, { Schema } from "mongoose";

const MarriageMakingSchema = new mongoose.Schema({
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
  boy: {
    name: {
      type: String,
      required: [true, "Boy's name is required"],
      trim: true,
    },
    dob: {
      type: String,
      required: [true, "Boy's date of birth is required"],
    },
    timeOfBirth: {
      type: String,
      required: [true, "Boy's time of birth is required"],
    },
    birthplace: {
      type: String,
      required: [true, "Boy's birthplace is required"],
      trim: true,
    },
  },
  girl: {
    name: {
      type: String,
      required: [true, "Girl's name is required"],
      trim: true,
    },
    dob: {
      type: String,
      required: [true, "Girl's date of birth is required"],
    },
    timeOfBirth: {
      type: String,
      required: [true, "Girl's time of birth is required"],
    },
    birthplace: {
      type: String,
      required: [true, "Girl's birthplace is required"],
      trim: true,
    },
  },
  language: {
    type: String,
    enum: [
      "Bengali",
      "Hindi",
      "Marathi",
      "English",
      "Gujarati",
      "Telugu",
      "Kannada",
      "Tamil",
    ],
    required: [true, "Language is required"],
  },
  isPaymentDone: {
    type: Boolean,
    default: false,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  wp_no: {
    type: String,
    required: [true, "Whatsapp number is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const MarriageMaking = mongoose.model(
  "MarriageMaking",
  MarriageMakingSchema
);
