import mongoose from "mongoose";

const liveTVSchema = new mongoose.Schema({
  channelName: { type: String, required: true },
  youtubeLink: { type: String, required: true },
  category: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const LiveTV = mongoose.model("LiveTV", liveTVSchema);
