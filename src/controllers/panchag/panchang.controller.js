import { Panchang } from "../../models/panchang/panchang.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Helper function to validate weekday from a date
const getWeekdayFromDate = (date) => {
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return weekdays[new Date(date).getDay()];
};

const getMonthFromDate = (date) => {
  const months = [
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
  ];
  return months[new Date(date).getMonth()];
};

// Create a new Panchang entry
export const createPanchang = asyncHandler(async (req, res) => {
  const { date, day, month, image } = req.body;

  if (!date || !day || !month || !image) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required"));
  }

  const formattedDate = new Date(date);
  if (getWeekdayFromDate(formattedDate) !== day) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Provided day does not match the given date")
      );
  }

  if (getMonthFromDate(formattedDate) !== month) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Provided month does not match the given date"
        )
      );
  }

  const panchangExists = await Panchang.findOne({ date: formattedDate });
  if (panchangExists) {
    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          null,
          "Panchang entry already exists for this date"
        )
      );
  }

  const panchang = await Panchang.create({
    date: formattedDate,
    day,
    month,
    image,
  });
  return res
    .status(201)
    .json(
      new ApiResponse(201, panchang, "Panchang entry created successfully")
    );
});

// Get all Panchang entries
export const getAllPanchang = asyncHandler(async (req, res) => {
  const panchangEntries = await Panchang.find();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        panchangEntries,
        "Panchang entries fetched successfully"
      )
    );
});

// Get Panchang by date
export const getPanchangByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const formattedDate = new Date(date);

  if (isNaN(formattedDate)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid date format"));
  }

  const panchangEntry = await Panchang.findOne({ date: formattedDate });
  if (!panchangEntry) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No Panchang entry found for the specified date"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, panchangEntry, "Panchang entry fetched successfully")
    );
});

// Get Panchang by day
export const getPanchangByDay = asyncHandler(async (req, res) => {
  const { day } = req.params;

  if (
    ![
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ].includes(day)
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid day format"));
  }

  const panchangEntries = await Panchang.find({ day });
  if (panchangEntries.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No Panchang entries found for the specified day"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        panchangEntries,
        "Panchang entries fetched successfully"
      )
    );
});

// Get Panchang by month
export const getPanchangByMonth = asyncHandler(async (req, res) => {
  const { month } = req.params;

  if (
    ![
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
    ].includes(month)
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid month format"));
  }

  const panchangEntries = await Panchang.find({ month });
  if (panchangEntries.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No Panchang entries found for the specified month"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        panchangEntries,
        "Panchang entries fetched successfully"
      )
    );
});

// Update Panchang by ID
export const updatePanchangById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, day, month, image } = req.body;

  const formattedDate = date ? new Date(date) : null;
  if (date && isNaN(formattedDate)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid date format"));
  }

  // Check if the provided date already exists in the database (except for the current entry being updated)
  const existingPanchang = await Panchang.findOne({
    date: formattedDate,
    _id: { $ne: id },
  });
  if (existingPanchang) {
    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          null,
          "Panchang entry already exists for the provided date"
        )
      );
  }

  if (date && day && getWeekdayFromDate(formattedDate) !== day) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Provided day does not match the given date")
      );
  }

  if (date && month && getMonthFromDate(formattedDate) !== month) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "Provided month does not match the given date"
        )
      );
  }

  const updatedPanchang = await Panchang.findByIdAndUpdate(
    id,
    { date: formattedDate, day, month, image },
    { new: true, runValidators: true }
  );

  if (!updatedPanchang) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Panchang entry not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPanchang,
        "Panchang entry updated successfully"
      )
    );
});

// Delete Panchang by ID
export const deletePanchangById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedPanchang = await Panchang.findByIdAndDelete(id);
  if (!deletedPanchang) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Panchang entry not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Panchang entry deleted successfully"));
});
