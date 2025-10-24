import express from "express";
import { createMarriageMakingByUserId, deleteMarriageMakingById, getAllMarriageMakings, getMarriageMakingById, updateMarriageMakingById } from "../../controllers/marriageMaking/marriageMaking.controller.js";


const router = express.Router();

router.post("/create/:userId", createMarriageMakingByUserId); // Create Marriage Making by User ID
router.get("/getAll", getAllMarriageMakings); // Get All Marriage Makings
router.get("/get/:id", getMarriageMakingById); // Get Marriage Making by ID
router.patch("/update/:id", updateMarriageMakingById); // Update Marriage Making by ID
router.delete("/delete/:id", deleteMarriageMakingById); // Delete Marriage Making by ID

export default router;
