import { AdminAd } from "../../models/advertisement/adminAd.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create Admin Ad API
export const createAdminAd = asyncHandler(async (req, res) => {
  try {
    const { image, phone, isActive } = req.body;

    // Validate required fields
    if (!image || !phone) {
      return res.status(400).json(
        new ApiResponse(400, null, "Missing required fields", {
          missingFields: ["image", "phone"].filter((field) => !req.body[field]),
        })
      );
    }

    // Create new Admin Ad entry
    const adminAd = new AdminAd({
      image,
      phone,
      isActive: isActive !== undefined ? isActive : true,
    });

    await adminAd.save();

    return res
      .status(201)
      .json(new ApiResponse(201, adminAd, "Admin Ad created successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Get All Admin Ads
export const getAllAdminAds = asyncHandler(async (req, res) => {
  try {
    const adminAds = await AdminAd.find();
    return res
      .status(200)
      .json(new ApiResponse(200, adminAds, "Admin Ads retrieved successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Get Admin Ad by ID
export const getAdminAdById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const adminAd = await AdminAd.findById(id);

    if (!adminAd) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin Ad not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, adminAd, "Admin Ad retrieved successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Update Admin Ad by ID
export const updateAdminAdById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { image, phone, isActive } = req.body;

    // Find and update the Admin Ad entry
    const updatedAdminAd = await AdminAd.findByIdAndUpdate(
      id,
      { image, phone, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedAdminAd) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin Ad not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedAdminAd, "Admin Ad updated successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Delete Admin Ad by ID
export const deleteAdminAdById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAdminAd = await AdminAd.findByIdAndDelete(id);

    if (!deletedAdminAd) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin Ad not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Admin Ad deleted successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});
