import mongoose, { Schema } from "mongoose";

const tierSchema = new Schema(
  {
    price: {
      type: Number,
      required: true,
    },
    durationInMonths: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    // Fixed per tier by design — never accepted from client update payloads.
    isPremium: {
      type: Boolean,
      required: true,
    },
    isTrusted: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const adSubscriptionSchema = new Schema({
  silver: {
    type: tierSchema,
    default: () => ({
      price: 99,
      durationInMonths: 1,
      features: ["30 Days Validity", "Standard Listing", "Basic Access"],
      isPremium: false,
      isTrusted: false,
    }),
  },
  gold: {
    type: tierSchema,
    default: () => ({
      price: 199,
      durationInMonths: 3,
      features: ["Premium Tag Included", "90 Days Validity", "Priority Support"],
      isPremium: true,
      isTrusted: false,
    }),
  },
  platinum: {
    type: tierSchema,
    default: () => ({
      price: 399,
      durationInMonths: 6,
      features: [
        "Premium Tag Included",
        "Free Trusted Badge",
        "TRUSTED MEMBER Label",
        "180 Days Validity",
        "Priority Support",
      ],
      isPremium: true,
      isTrusted: true,
    }),
  },
});

export const AdSubscription = mongoose.model("AdSubscription", adSubscriptionSchema);
