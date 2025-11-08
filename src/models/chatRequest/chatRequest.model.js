import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    astrologerId: {
      type: Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "ended"],
      default: "pending",
    },
    channelName: {
      type: String,
      default: null,
    },
    chatType: {
      type: String,
      enum: ["text", "audio", "video"],
      required: true,
    },
    roomId: { type: String },
    startTime: { type: String }, // Changed to String
    endTime: { type: String },
  },
  { timestamps: true }
);

export const ChatRequest = mongoose.model("ChatRequest", chatRequestSchema);
