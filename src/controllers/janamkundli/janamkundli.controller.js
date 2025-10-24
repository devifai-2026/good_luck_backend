import { User } from "../../models/auth/user.model.js";
import { JanamKundli } from "../../models/janamkundli/janamkundli.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create Janam Kundli by User ID
export const createJanamKundliByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { date, time, place, gender, language, wp_no } = req.body;

  // Validate the User
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  // Validate required fields
  if (!date || !time || !place || !gender || !language || !wp_no) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required"));
  }

  // Create a new Janam Kundli entry
  const janamKundli = await JanamKundli.create({
    userId,
    authId: user.authId,
    date,
    time,
    place,
    gender,
    language,
    wp_no,
    isPaymentDone: true, // Assuming payment is done during creation
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, janamKundli, "Janam Kundli created successfully")
    );
});

// Get All Janam Kundli Records
export const getAllJanamKundlis = asyncHandler(async (req, res) => {
  const janamKundlis = await JanamKundli.find().sort({ createdAt: -1 }); // Sort by most recent

  return res
    .status(200)
    .json(
      new ApiResponse(200, janamKundlis, "All Janam Kundli records retrieved")
    );
});

// Get Janam Kundli by ID
export const getJanamKundliById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const janamKundli = await JanamKundli.findById(id);

    if (!janamKundli) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Janam Kundli entry not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, janamKundli, "Janam Kundli retrieved successfully")
      );
  } catch (error) {
    new ApiResponse(500, null, error.message);
  }
});

// Update Janam Kundli by ID
export const updateJanamKundliById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const janamKundli = await JanamKundli.findById(id);
    if (!janamKundli) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Janam Kundli entry not found"));
    }

    const updatedJanamKundli = await JanamKundli.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("userId", "Fname", "Lname")
      .populate("authId", "phone");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedJanamKundli,
          "Janam Kundli updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Delete Janam Kundli by ID
export const deleteJanamKundliById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const janamKundli = await JanamKundli.findById(id);
    if (!janamKundli) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Janam Kundli entry not found"));
    }

    await JanamKundli.findByIdAndDelete(id);

    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Janam Kundli entry deleted successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
