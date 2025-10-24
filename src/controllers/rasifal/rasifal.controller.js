import { Rasifal } from "../../models/rasifal/rasifal.model.js";
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

// Helper function to get the month from a date
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

// Create a new Rasifal entry
export const createRasifal = asyncHandler(async (req, res) => {
  const { date, day, image, month } = req.body; // Accept month in the request body

  if (!date || !day || !image || !month) {
    // Ensure month is provided
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "All fields (date, day, image, month) are required"
        )
      );
  }

  const formattedDate = new Date(date);

  // Validate that the provided date matches the given day
  if (getWeekdayFromDate(formattedDate) !== day) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Provided day does not match the given date")
      );
  }

  // Validate that the provided month matches the month from the date
  const monthFromDate = getMonthFromDate(formattedDate);
  if (month !== monthFromDate) {
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

  const rasifalExists = await Rasifal.findOne({ date: formattedDate });
  if (rasifalExists) {
    return res
      .status(409)
      .json(
        new ApiResponse(409, null, "Rasifal entry already exists for this date")
      );
  }

  const rasifal = await Rasifal.create({
    date: formattedDate,
    day,
    image,
    month, // Save the month provided by the user
  });

  return res
    .status(201)
    .json(new ApiResponse(201, rasifal, "Rasifal entry created successfully"));
});

// Get all Rasifal entries
export const getAllRasifal = asyncHandler(async (req, res) => {
  const rasifalEntries = await Rasifal.find();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        rasifalEntries,
        "Rasifal entries fetched successfully"
      )
    );
});

// Get Rasifal by date
export const getRasifalByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const formattedDate = new Date(date);

  if (isNaN(formattedDate)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid date format"));
  }

  const rasifalEntry = await Rasifal.findOne({ date: formattedDate });
  if (!rasifalEntry) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No Rasifal entry found for the specified date"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, rasifalEntry, "Rasifal entry fetched successfully")
    );
});

// Get Rasifal by day
export const getRasifalByDay = asyncHandler(async (req, res) => {
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

  const rasifalEntries = await Rasifal.find({ day });
  if (rasifalEntries.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No Rasifal entries found for the specified day"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        rasifalEntries,
        "Rasifal entries fetched successfully"
      )
    );
});

// Get Rasifal by month
export const getRasifalByMonth = asyncHandler(async (req, res) => {
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

  const rasifalEntries = await Rasifal.find({ month });
  if (rasifalEntries.length === 0) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "No Rasifal entries found for the specified month"
        )
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        rasifalEntries,
        "Rasifal entries fetched successfully"
      )
    );
});

// Update Rasifal by ID
export const updateRasifalById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date, day, image, month } = req.body; // Accept month in the request body

  const formattedDate = date ? new Date(date) : null;
  const monthFromDate = formattedDate ? getMonthFromDate(formattedDate) : null;

  if (date && isNaN(formattedDate)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid date format"));
  }

  // Check if the provided date already exists in the database (except for the current entry being updated)
  const existingRasifal = await Rasifal.findOne({
    date: formattedDate,
    _id: { $ne: id },
  });
  if (existingRasifal) {
    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          null,
          "Rasifal entry already exists for the provided date"
        )
      );
  }

  // Check if an entry exists for the updated day
  if (day) {
    const existingDayEntry = await Rasifal.findOne({
      day,
      _id: { $ne: id },
    });
    if (existingDayEntry) {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            null,
            "Rasifal entry already exists for the provided day"
          )
        );
    }
  }

  // If the month is provided, ensure it matches the month from the date
  if (month && month !== monthFromDate) {
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

  // Validate that the provided day matches the date
  if (date && day && getWeekdayFromDate(formattedDate) !== day) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Provided day does not match the given date")
      );
  }

  // Update the Rasifal entry, including the provided month
  const updatedRasifal = await Rasifal.findByIdAndUpdate(
    id,
    { date: formattedDate, day, image, month: month || monthFromDate }, // Use provided month or derive from date
    { new: true, runValidators: true }
  );

  if (!updatedRasifal) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Rasifal entry not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedRasifal, "Rasifal entry updated successfully")
    );
});

// Delete Rasifal by ID
export const deleteRasifalById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedRasifal = await Rasifal.findByIdAndDelete(id);
  if (!deletedRasifal) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Rasifal entry not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Rasifal entry deleted successfully"));
});
