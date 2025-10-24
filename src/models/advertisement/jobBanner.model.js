import mongoose, { Schema } from "mongoose";

const jobBannerSchema = new Schema(
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
      required: [true, "Work location is required."],
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
    banner_url: {
      type: String,
      required: [true, "Banner URL is required."],
      match: [
        /^(http|https):\/\/[^ "]+$/,
        "Please enter a valid URL for the banner.",
      ],
    },
    category: {
      type: String,
      enum: ["Govt", "Private"],
      required: [true, "Category is required."],
    },
  },
  { timestamps: true }
);

export const JobBanner = mongoose.model("JobBanner", jobBannerSchema);
