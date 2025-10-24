import mongoose from "mongoose";

const RasifalSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "Date is required"],
  },
  day: {
    type: String,
    required: [true, "Day is required"],
    enum: {
      values: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      message:
        "Day must be one of: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday",
    },
  },
  month: {
    type: String,
    required: [true, "Month is required"],
    enum: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    message:
      "Month must be one of: January, February, March, April, May, June, July, August, September, October, November, December",
  },
  image: {
    type: String,
    required: [true, "Image URL is required"],
  },
});

export const Rasifal = mongoose.model("Rasifal", RasifalSchema);
