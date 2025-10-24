import mongoose, { Schema } from "mongoose";

const withdrawalRequestSchema = new Schema(
  {
    astrologerId: {
      type: Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [100, "Minimum withdrawal amount is 100"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

export const WithdrawalRequest = mongoose.model(
  "WithdrawalRequest",
  withdrawalRequestSchema
);
