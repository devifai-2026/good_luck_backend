import mongoose, { Schema } from "mongoose";

const astrologyPricingSchema = new Schema(
  {
    matchmakingPrice: {
      type: Number,
      required: true,
      default: 49,
    },
    janamKundaliPrice: {
      type: Number,
      required: true,
      default: 99,
    },
  },
  { timestamps: true }
);

export const AstrologyPricing = mongoose.model(
  "AstrologyPricing",
  astrologyPricingSchema
);
