import mongoose, { Schema } from "mongoose";

const matrimonySubscriptionSchema = new Schema({
  one_month_plan: {
    type: Number,
    default: 99,
  },
  one_year_plan: {
    type: Number,
    default: 999,
  },
});

export const MatrimonySubscription = mongoose.model("MatrimonySubscription", matrimonySubscriptionSchema);
