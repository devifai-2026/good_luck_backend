import mongoose, { Schema } from "mongoose";

const matchedDatingProfileSchema = new Schema(
  {
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    matchDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  {
    timestamps: true,
  }
);

export const MatchedProfileDating = mongoose.model(
  "MatchedProfileDating",
  matchedDatingProfileSchema
);