import mongoose, { Schema } from "mongoose";

// Define your serviceAdSchema
const serviceAdSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    homeAdType: {
      type: String,
      enum: ["HomeLandText", "HomeLandBanner"],
      default: "",
    },
    homeLandAdId: {
      type: Schema.Types.ObjectId,
    },
    jobAdType: {
      type: String,
      enum: ["JobText", "JobBanner"],
      default: "",
    },
    job_ad_id: {
      type: Schema.Types.ObjectId,
    },
    generale_ads: {
      type: Schema.Types.ObjectId,
      ref: "GeneralAd",
    },
  },
  { timestamps: true }
);

export const ServiceAds = mongoose.model("ServiceAds", serviceAdSchema);
