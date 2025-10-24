import mongoose, { Schema } from "mongoose";

// Define the HomeTextSchema
const homeLandTextSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
    },
    city: {
      type: String,
      required: [true, "City is required."],
    },
    state: {
      type: String,
      required: [true, "State is required."],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required."],
    },
    price: {
      type: String,
      required: [true, "Price is required."],
    },
    phone: {
      type: String,
      // required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    text_ad_description: {
      type: String,
      required: [true, "Text ad description is required."],
    },
    total_character: {
      type: Number,
      required: true,
      min: [1, "Total character count must be at least 1."],
    },
    category: {
      type: String,
      enum: ["Home", "Land"],
      required: [true, "Category is required."],
    },
  },
  { timestamps: true }
);

export const HomeLandText = mongoose.model("HomeLandText", homeLandTextSchema);
