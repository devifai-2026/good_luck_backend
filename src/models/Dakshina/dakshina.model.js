import mongoose from "mongoose";

const dakshinaSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    god_name: {
      type: String,
      required: [true, "God name is required"],
      trim: true,
    },
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: [true, "Day is required"],
    },
  },
  {
    timestamps: true,
  }
);

export const Dakshina = mongoose.model("Dakshina", dakshinaSchema);
