import mongoose, { Schema } from "mongoose";

// Define the schema for storing messages in the chat
const chatMessageSchema = new Schema(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "MatchedProfileDating", // Reference to the matched profile to associate messages with the match
      required: true,
    },
    messages: [
      {
        senderId: {
          type: Schema.Types.ObjectId,
          ref: "User", // Reference to the sender (user)
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create and export the Chat model
export const Chat = mongoose.model("Chat", chatMessageSchema);
