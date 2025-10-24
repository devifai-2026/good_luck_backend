import mongoose, { Schema } from "mongoose";

const janamKundliSchema = new mongoose.Schema(
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
    date: {
      type: String,
      required: [true, "Date of birth is required"],
    },
    time: {
      type: String,
      required: [true, "Time of birth is required"],
    },
    place: {
      type: String,
      required: [true, "Place of birth is required"],
      trim: true,
    },
    gender: {
      type: String,
      enum: ["boy", "girl"],
      required: [true, "Gender is required"],
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
      required: [true, "Girl's language is required"],
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
  },
  {
    timestamps: true,
  }
);

export const JanamKundli = mongoose.model("JanamKundli", janamKundliSchema);
