import { AstrologerCategory } from "../../models/astrologer/astrologerCategory.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create Astrologer Category
export const createAstrologerCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name is required"));
    }

    const existingCategory = await AstrologerCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name already exists"));
    }

    const category = new AstrologerCategory({ name });
    await category.save();

    return res
      .status(201)
      .json(new ApiResponse(201, category, "Category created successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Get All Astrologer Categories
export const getAstrologerCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await AstrologerCategory.find();
    console.log(categories);
    return res
      .status(200)
      .json(
        new ApiResponse(200, categories, "Categories retrieved successfully")
      );
  } catch (error) {
    console.error("Error fetching categories:", error.message); // Log error stack for more details
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Update Astrologer Category By ID
export const updateAstrologerCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name is required"));
    }

    const updatedCategory = await AstrologerCategory.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCategory, "Category updated successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Delete Astrologer Category By ID
export const deleteAstrologerCategoryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await AstrologerCategory.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedCategory, "Category deleted successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});
