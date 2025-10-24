import { Admin } from "../../models/admin/admin.model.js";
import { User } from "../../models/auth/user.model.js";
import { Dakshina } from "../../models/Dakshina/dakshina.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new Dakshina
export const createDakshina = asyncHandler(async (req, res) => {
  const { image, god_name, day } = req.body;

  // Validate required fields
  if (!image || !god_name || !day) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "All fields are required"));
  }

  // Create a new Dakshina entry
  const dakshina = await Dakshina.create({ image, god_name, day });

  return res
    .status(201)
    .json(new ApiResponse(201, dakshina, "Dakshina created successfully"));
});

// Get all Dakshinas
export const getAllDakshinas = asyncHandler(async (req, res) => {
  const dakshinas = await Dakshina.find();
  return res
    .status(200)
    .json(
      new ApiResponse(200, dakshinas, "All Dakshinas retrieved successfully")
    );
});

// Get Dakshinas by day
export const getDakshinasByDay = asyncHandler(async (req, res) => {
  const { day } = req.params;

  // Validate day parameter
  if (
    ![
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].includes(day)
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid day provided"));
  }

  const dakshinas = await Dakshina.find({ day });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        dakshinas,
        `Dakshinas for ${day} retrieved successfully`
      )
    );
});

// Update Dakshina by ID
export const updateDakshinaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  const dakshina = await Dakshina.findById(id);
  if (!dakshina) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Dakshina not found"));
  }

  // Update only the fields provided in the request body
  Object.keys(req.body).forEach((key) => {
    dakshina[key] = req.body[key];
  });

  const updatedDakshina = await dakshina.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedDakshina, "Dakshina updated successfully")
    );
});

// Delete Dakshina by ID
export const deleteDakshinaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find and delete the Dakshina by ID
  const deletedDakshina = await Dakshina.findByIdAndDelete(id);

  if (!deletedDakshina) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Dakshina not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedDakshina, "Dakshina deleted successfully")
    );
});

// POST API for Payment
export const makePayment = asyncHandler(async (req, res) => {
  try {
    const { userId, amount } = req.body;

    // Validate required fields
    if (!userId || !amount) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "userId, amount are required"));
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Find the admin (assuming there's only one admin for simplicity)
    const admin = await Admin.findOne();
    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found"));
    }

    // Handle debit transaction (user pays admin)
    // Add amount to admin's wallet
    admin.wallet.balance += amount;

    // Add transaction to user's transactionHistory
    user.wallet.transactionHistory.push({
      timestamp: new Date(),
      type: "debit",
      debit_type: "dakshina",
      amount,
      reference: null,
      description: `Payment made to admin`,
    });

    // Add transaction to admin's transactionHistory
    admin.wallet.transactionHistory.push({
      timestamp: new Date(),
      type: "credit",
      credit_type: "dakshina",
      amount,
      reference: null,
      description: `Payment received from ${user.Fname} ${user.Lname}`,
    });

    // Save the updated user and admin documents
    await user.save();
    await admin.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { success: true },
          "Payment processed successfully"
        )
      );
  } catch (error) {
    // Handle unexpected errors
    console.error("Error processing payment:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});
