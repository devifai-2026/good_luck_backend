import mongoose, { Schema } from "mongoose";

// Define the HomeTextSchema
const jobTextSchema = new Schema(
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
    company_name: {
      type: String,
      // required: [true, "Company name is required."],
    },
    work_location: {
      type: String,
      required: [true, "Work location name is required."],
    },
    website: {
      type: String,
    },
    salary: {
      type: String,
      required: [true, "Salary is required."],
    },
    city: {
      type: String,
      required: [true, "City is required."],
    },
    state: {
      type: String,
      required: [true, "State is required."],
    },
    address: {
      type: String,
      required: [true, "Address is required."],
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required."],
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
      enum: ["Govt", "Private"],
      required: [true, "Category is required."],
    },
  },
  { timestamps: true }
);

export const JobText = mongoose.model("JobText", jobTextSchema);
