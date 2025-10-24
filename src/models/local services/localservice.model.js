import mongoose, { Schema } from "mongoose";

const LocalServiceSchema = new mongoose.Schema({
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
  category: {
    type: Schema.Types.ObjectId,
    ref: "LocalServiceCategory",
    required: [true, "Service category is required"],
  },
  image: {
    type: String,
    required: [true, "Service banner is required"],
    trim: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  contact: {
    type: String,
    required: [true, "Contact number is required"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
    trim: true,
  },
  state: {
    type: String,
    required: [true, "State is required"],
    trim: true,
  },
  pinCode: {
    type: String,
    required: [true, "PIN code is required"],
    trim: true,
    match: [/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit PIN code"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const LocalService = mongoose.model("LocalService", LocalServiceSchema);
