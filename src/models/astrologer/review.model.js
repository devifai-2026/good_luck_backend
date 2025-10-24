import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  Fname: { type: String },
  Lname: { type: String },
  profile_picture: { type: String },
});

export default reviewSchema;
