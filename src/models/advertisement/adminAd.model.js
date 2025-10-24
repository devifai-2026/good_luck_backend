import mongoose from "mongoose";

const adminAdSchema = new mongoose.Schema({
  image: { type: String, required: true },
  phone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const AdminAd = mongoose.model("AdminAd", adminAdSchema);
