import mongoose, { Schema } from "mongoose";

const matrimonySchema = new Schema(
  {
    authId: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Fname: {
      type: String,
      required: [true, "First name is required"],
    },
    Lname: {
      type: String,
      required: [true, "Last name is required"],
    },
    photo: {
      type: [String],
      required: [true, "Photo is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    salary: {
      type: String,
      // required: [true, "Salary is required"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [18, "Minimum age is 18"],
    },
    bio: {
      type: String,
    },
    isDivorce: {
      type: Boolean,
      default: false,
    },
    sent_likes_id: {
      type: [Schema.Types.ObjectId],
      ref: "Matrimony",
      default: [],
    },
    pending_likes_id: {
      type: [Schema.Types.ObjectId],
      ref: "Matrimony",
      default: [],
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
    },
    cast: {
      type: String,
      enum: ["hindu", "muslim", "others"],
      required: true,
    },
    searching_for: {
      type: String,
      enum: ["bride", "groom"],
      required: true,
    },
    interests: {
      type: [String],
      enum: [
        "badminton",
        "football",
        "cricket",
        "makeUp",
        "dance",
        "yoga",
        "meditation",
        "swimming",
        "movie",
        "party",
      ],
      required: true,
    },
    whatsappNumber: {
      type: String,
      // required: true,
    },
    facebookLink: {
      type: String,
      // required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    see_limit: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Matrimony = mongoose.model("Matrimony", matrimonySchema);
