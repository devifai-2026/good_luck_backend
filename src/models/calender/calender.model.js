import mongoose from "mongoose";

const CalendarSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

export const Calendar = mongoose.model("Calendar", CalendarSchema);
