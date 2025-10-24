import mongoose from "mongoose";

const CalendarEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: [
        "pujodate",
        "bibahodate",
        "omabossya",
        "purnima",
        "ekadosi",
        "suvodin",
        "sastrokotha",
      ],
      message:
        "Event type must be one of: pujodate, bibahodate, omabossya, purnima, ekadosi, suvodin, sastrokotha",
    },
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export const CalendarEvent = mongoose.model(
  "CalendarEvent",
  CalendarEventSchema
);
