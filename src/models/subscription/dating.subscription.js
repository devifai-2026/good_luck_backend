import mongoose, { Schema } from "mongoose";

const datingSubscriptionSchema = new Schema({
  one_month_plan: {
    type: Number,
    default: 99,
  },
  one_year_plan: {
    type: Number,
    default: 999,
  },
});

export const DatingSubscription = mongoose.model("DatingSubscription", datingSubscriptionSchema);
