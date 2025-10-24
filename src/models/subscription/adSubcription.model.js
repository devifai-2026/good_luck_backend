import mongoose, { Schema } from "mongoose";

const adSubscriptionSchema = new Schema({
  one_month_plan: {
    type: Number,
    default: 99,
  },
  one_year_plan: {
    type: Number,
    default: 999,
  },
});

export const AdSubscription = mongoose.model("AdSubscription", adSubscriptionSchema);
