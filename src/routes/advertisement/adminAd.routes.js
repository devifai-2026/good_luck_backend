import express from "express";
import {
  createAdminAd,
  getAllAdminAds,
  getAdminAdById,
  updateAdminAdById,
  deleteAdminAdById,
} from "../../controllers/advertisement/adminAd.controller.js";

const router = express.Router();

// Create a new admin ad
router.post("/", createAdminAd);

// Get all admin ads
router.get("/", getAllAdminAds);

// Get a specific admin ad by ID
router.get("/:id", getAdminAdById);

// Update an admin ad by ID
router.put("/:id", updateAdminAdById);

// Delete an admin ad by ID
router.delete("/:id", deleteAdminAdById);

export default router;
