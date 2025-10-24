import mongoose from "mongoose";

const { Schema } = mongoose;

// Define the AstrologerCategory schema
const astrologerCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
    }
  },
  { timestamps: true }
);

// Create the model for AstrologerCategory
export const AstrologerCategory = mongoose.model(
  "AstrologerCategory",
  astrologerCategorySchema
);
