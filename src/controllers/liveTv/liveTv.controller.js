import { LiveTV } from "../../models/liveTv/live.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create Live TV API
export const createLiveTV = asyncHandler(async (req, res) => {
  try {
    const { channelName, youtubeLink, category, isActive } = req.body;

    // Validate required fields
    if (!channelName || !youtubeLink) {
      return res.status(400).json(
        new ApiResponse(400, null, "Missing required fields", {
          missingFields: ["channelName", "youtubeLink"].filter(
            (field) => !req.body[field]
          ),
        })
      );
    }

    // Check if the YouTube link already exists
    const existingLiveTV = await LiveTV.findOne({ youtubeLink });
    if (existingLiveTV) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "YouTube link already exists"));
    }

    // Create new Live TV entry
    const liveTV = new LiveTV({
      channelName,
      youtubeLink,
      category,
      isActive: isActive !== undefined ? isActive : true,
    });

    await liveTV.save();

    return res
      .status(201)
      .json(new ApiResponse(201, liveTV, "Live TV created successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Get All Live TV Channels
export const getAllLiveTV = asyncHandler(async (req, res) => {
  try {
    const liveTVs = await LiveTV.find();
    return res
      .status(200)
      .json(
        new ApiResponse(200, liveTVs, "Live TV channels retrieved successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Get Live TV by ID
export const getLiveTVById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const liveTV = await LiveTV.findById(id);

    if (!liveTV) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Live TV not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, liveTV, "Live TV retrieved successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Update Live TV by ID
export const updateLiveTVById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { channelName, youtubeLink, category, isActive } = req.body;

    // Find and update the Live TV entry
    const updatedLiveTV = await LiveTV.findByIdAndUpdate(
      id,
      { channelName, youtubeLink, category, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedLiveTV) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Live TV not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedLiveTV, "Live TV updated successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Delete Live TV by ID
export const deleteLiveTVById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLiveTV = await LiveTV.findByIdAndDelete(id);

    if (!deletedLiveTV) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Live TV not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Live TV deleted successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});
