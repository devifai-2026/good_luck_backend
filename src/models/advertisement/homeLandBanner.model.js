import mongoose, { Schema } from "mongoose";

const homeLandBannerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
    },
    city: {
      type: String,
      required: [true, "City is required."],
    },
    state: {
      type: String,
      required: [true, "State is required."],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required."],
    },
    phone: {
      type: String,
      required: [true, "Phone is required."],
    },
    price: {
      type: String,
      required: [true, "Price is required."],
    },
    banner_url: {
      type: String,
      required: [true, "Banner URL is required."],
      match: [
        /^(http|https):\/\/[^ "]+$/,
        "Please enter a valid URL for the banner.",
      ],
    },
    category: {
      type: String,
      enum: ["Home", "Land"],
      required: [true, "Category is required."],
    },
  },
  { timestamps: true }
);

export const HomeLandBanner = mongoose.model("HomeLandBanner", homeLandBannerSchema);
