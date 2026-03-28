import mongoose, { Schema } from "mongoose";

const LocalServiceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    trim: true,
  },
  icon: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const LocalServiceCategory = mongoose.model(
  "LocalServiceCategory",
  LocalServiceCategorySchema
);
