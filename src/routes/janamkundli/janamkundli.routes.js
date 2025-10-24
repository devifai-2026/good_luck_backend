import express from "express";
import {
  createJanamKundliByUserId,
  deleteJanamKundliById,
  getAllJanamKundlis,
  getJanamKundliById,
  updateJanamKundliById,
} from "../../controllers/janamkundli/janamkundli.controller.js";

const router = express.Router();

// Create by User ID
router.post("/create/:userId", createJanamKundliByUserId);

// Get All
router.get("/getall", getAllJanamKundlis);

// Get Janam Kundli by ID
router.get("/get/:id", getJanamKundliById);

// Update by ID
router.patch("/update/:id", updateJanamKundliById);

// Delete by ID
router.delete("/delete/:id", deleteJanamKundliById);

export default router;
