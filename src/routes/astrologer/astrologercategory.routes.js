import { Router } from "express";
import { createAstrologerCategory, deleteAstrologerCategoryById, getAstrologerCategories, updateAstrologerCategoryById } from "../../controllers/astrologer/astrologerCategory.controller.js";
import { filterAstrologersBySpecialization } from "../../controllers/astrologer/astrologerController.js";
const router = Router();

// Create a new category
router.post("/create", createAstrologerCategory);

// Get all categories
router.get("/getAll", getAstrologerCategories);

// Update a category by ID
router.patch("/update/:id", updateAstrologerCategoryById);

// Delete a category by ID
router.delete("/delete/:id", deleteAstrologerCategoryById);

router.post("/filter", filterAstrologersBySpecialization);


export default router;