import mongoose, { Schema } from "mongoose";
import walletSchema from "../wallet/wallet.model.js";

const adminSchema = new Schema(
  {
    authId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wallet: {
      type: walletSchema, // Use the wallet schema here
      default: () => ({ balance: 0, transactionHistory: [] }), // Default structure for the wallet
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
