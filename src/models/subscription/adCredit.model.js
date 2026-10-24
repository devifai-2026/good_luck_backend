import mongoose, { Schema } from "mongoose";

// One paid slot for exactly one ad. Advertisement and Local Service are
// pay-per-ad: every purchase creates an "available" credit for the chosen
// category, and creating an ad in that category consumes one credit. The ad
// then stays live for the credit's durationInMonths.
const adCreditSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    service: {
      type: String,
      enum: ["advertisement", "localService"],
      required: true,
    },
    // advertisement: "HomeLand" | "Job"; localService: LocalServiceCategory id
    category: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      enum: ["silver", "gold", "platinum"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    durationInMonths: {
      type: Number,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    isTrusted: {
      type: Boolean,
      default: false,
    },
    isPromoApplied: {
      type: Boolean,
      default: false,
    },
    promo_code: {
      type: Number,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["available", "used"],
      default: "available",
    },
    usedFor: {
      adType: { type: String },
      adId: { type: Schema.Types.ObjectId },
    },
    usedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

adCreditSchema.index({ userId: 1, service: 1, category: 1, status: 1 });

export const AdCredit = mongoose.model("AdCredit", adCreditSchema);
