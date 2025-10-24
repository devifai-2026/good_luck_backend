import { User } from "../../models/auth/user.model.js";
import { MarriageMaking } from "../../models/marriageMaking/marriageMaking.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create Marriage Making by User ID
export const createMarriageMakingByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { boy, girl, wp_no, language } = req.body;

  // Validate the User
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  // Validate boy details
  if (!boy || !boy.name || !boy.dob || !boy.timeOfBirth || !boy.birthplace) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "All boy details (name, dob, timeOfBirth, birthplace) are required"
        )
      );
  }

  // Validate girl details
  if (
    !girl ||
    !girl.name ||
    !girl.dob ||
    !girl.timeOfBirth ||
    !girl.birthplace
  ) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "All girl details (name, dob, timeOfBirth, birthplace) are required"
        )
      );
  }

  // Validate language
  if (!language) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Language is required"));
  }

  // Validate WhatsApp number
  if (!wp_no || !/^\d{10}$/.test(wp_no)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          "A valid 10-digit WhatsApp number is required"
        )
      );
  }

  // Create a new Matchmaking entry
  try {
    const marriageMaking = await MarriageMaking.create({
      userId,
      authId: user.authId,
      boy,
      girl,
      language,
      isPaymentDone: true,
      wp_no,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          marriageMaking,
          "Marriage matchmaking details created successfully"
        )
      );
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, `Validation Error: ${errors.join(", ")}`)
        );
    }

    // Handle any other errors
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// Get All Marriage Making
export const getAllMarriageMakings = asyncHandler(async (req, res) => {
  try {
    const marriageMakings = await MarriageMaking.find();

    // Check if no data is found
    if (!marriageMakings || marriageMakings.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No marriage making details found"));
    }

    // Return success response with data
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          marriageMakings,
          "Marriage making details retrieved successfully"
        )
      );
  } catch (error) {
    // Handle Mongoose-specific errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, `Validation Error: ${errors.join(", ")}`)
        );
    }

    // Handle all other errors
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// Get Marriage Making by ID
export const getMarriageMakingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const marriageMaking = await MarriageMaking.findById(id);
    if (!marriageMaking) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Marriage making not found"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          marriageMaking,
          "Marriage making details retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Update Marriage Making by ID
export const updateMarriageMakingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body; // Dynamically handle fields from the request body

  try {
    // Validate the existence of the record
    const marriageMaking = await MarriageMaking.findById(id);
    if (!marriageMaking) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Marriage making entry not found"));
    }

    // Update the record with the provided fields
    const updatedMarriageMaking = await MarriageMaking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedMarriageMaking,
          "Marriage making details updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Delete Marriage Making by ID
export const deleteMarriageMakingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMarriageMaking = await MarriageMaking.findByIdAndDelete(id);
    if (!deletedMarriageMaking) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Marriage making not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Marriage making details deleted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
