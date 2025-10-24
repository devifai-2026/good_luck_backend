import { Calendar } from "../../models/calender/calender.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new Calendar entry
export const createCalendarEntry = asyncHandler(async (req, res) => {
  const { month, image } = req.body;

  // Check for required fields
  if (!month || !image) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Month and Image are required"));
  }

  // Validate month against allowed values
  const validMonths = [
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
  if (!validMonths.includes(month)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          `Invalid month. Choose from: ${validMonths.join(", ")}`
        )
      );
  }

  // Check for duplicate month entry
  const existingEntry = await Calendar.findOne({ month });
  if (existingEntry) {
    return res
      .status(409)
      .json(new ApiResponse(409, null, "Entry for this month already exists"));
  }

  // Create the calendar entry
  const calendarEntry = await Calendar.create({ month, image });

  return res
    .status(201)
    .json(
      new ApiResponse(201, calendarEntry, "Calendar entry created successfully")
    );
});

// Get all Calendar entries
export const getAllCalendarEntries = asyncHandler(async (req, res) => {
  const calendarEntries = await Calendar.find();
  res.status(200).json(new ApiResponse(200, calendarEntries, "Success"));
});

// Get Calendar entry by month
export const getCalendarEntryByMonth = asyncHandler(async (req, res) => {
  const { month } = req.params;

  if (!month) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Month parameter is required"));
  }

  const calendarEntry = await Calendar.findOne({ month });

  if (!calendarEntry) {
    return res
      .status(404)
      .json(
        new ApiResponse(404, null, "No calendar entry found for this month")
      );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        calendarEntry,
        "Calendar entry retrieved successfully"
      )
    );
});

// Update a Calendar entry by ID
export const updateCalendarEntryById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { month, image } = req.body;

  // Input validation for required fields
  if (!month || !image) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Month and Image are required"));
  }

  // Check for valid month enum
  const validMonths = [
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
  if (!validMonths.includes(month)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          `Invalid month. Choose from: ${validMonths.join(", ")}`
        )
      );
  }

  // Update the calendar entry
  const updatedEntry = await Calendar.findByIdAndUpdate(
    id,
    { month, image },
    { new: true, runValidators: true }
  );

  // Handle missing entry scenario
  if (!updatedEntry) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Calendar entry not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedEntry, "Calendar entry updated successfully")
    );
});

// Delete a Calendar entry by ID
export const deleteCalendarEntryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedEntry = await Calendar.findByIdAndDelete(id);

  if (!deletedEntry) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Calendar entry not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, [], "Calendar entry deleted successfully"));
});
