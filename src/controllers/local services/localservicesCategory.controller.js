import { LocalServiceCategory } from "../../models/local services/localserviceCategory.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new category
export const createCategory = asyncHandler(async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name is required"));
    }

    const existingCategory = await LocalServiceCategory.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category already exists"));
    }

    const newCategory = new LocalServiceCategory({ name });
    await newCategory.save();

    const savedCategory = await LocalServiceCategory.findById(
      newCategory._id
    ).select("-createdAt -updatedAt");

    return res
      .status(201)
      .json(
        new ApiResponse(201, savedCategory, "Category created successfully")
      );
  } catch (error) {
    next(error);
  }
});

// Get all categories
export const getAllCategories = asyncHandler(async (req, res, next) => {
  try {
    const categories = await LocalServiceCategory.find();

    if (!categories || categories.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No categories found"));
    }

    res.json(
      new ApiResponse(200, categories, "Categories fetched successfully")
    );
  } catch (error) {
    next(error);
  }
});

// Get category by ID
export const getCategoryById = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await LocalServiceCategory.findById(id);

    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    res.json(new ApiResponse(200, category, "Category fetched successfully"));
  } catch (error) {
    next(error);
  }
});

// Update Category by ID
export const updateCategory = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Category name is required"));
    }

    // Check if category exists before updating
    const existingCategory = await LocalServiceCategory.findById(id);
    if (!existingCategory) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    // Perform update
    existingCategory.name = name;
    await existingCategory.save();

    res.json(
      new ApiResponse(200, existingCategory, "Category updated successfully")
    );
  } catch (error) {
    next(error);
  }
});

// Delete a category by ID
export const deleteCategory = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await LocalServiceCategory.findByIdAndDelete(id);

    if (!category) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Category not found"));
    }

    res.json(new ApiResponse(200, null, "Category deleted successfully"));
  } catch (error) {
    next(error);
  }
});
