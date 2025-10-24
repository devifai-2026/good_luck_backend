import mongoose from "mongoose";
import moment from "moment-timezone";

const astrologerChatSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true }, // The chat room identifier
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "senderModel", // Dynamically resolves to either User or Astrologer
        },
        senderModel: {
          type: String,
          required: true,
          enum: ["User", "Astrologer"], // Specifies which model senderId references
        },
        receiverId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "receiverModel",
        },
        receiverModel: {
          type: String,
          required: true,
          enum: ["User", "Astrologer"],
        },
        message: { type: String, required: true }, // The message content
        timestamp: {
          type: Date,
          default: function () {
            // Set the timestamp to the local timezone before saving
            return moment().tz("Asia/Kolkata").toDate(); // Change to your desired timezone
          },
        },
      },
    ],
    duration: { type: String }, // Duration in seconds (or minutes depending on your need)
  },
  { timestamps: true }
);

export const AstrologerChat = mongoose.model(
  "AstrologerChat",
  astrologerChatSchema
);
