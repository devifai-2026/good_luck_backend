import express from "express";
import {
  createJobTextAd,
  deleteJobTextAdByUserIdAndAdId,
  getAllJobTextAds,
  getAllJobTextAdsByCategory,
  getJobTextAdsByUserId,
  getJobTextAdsByUserIdAndCategory,
  updateJobTextAdByUserIdAndAdId,
} from "../../controllers/advertisement/jobText.controller.js";

const router = express.Router();

// Route to create a JobText ad and a corresponding ServiceAd
router.post("/create", createJobTextAd);

// Route to get all JobText ads
router.get("/", getAllJobTextAds);

// Route to get JobText ads by userId
router.get("/:userId", getJobTextAdsByUserId);

// Route to get JobText ads by userId and category
router.get(
  "/getJobTextAdsByUserIdAndCategory/:userId/:category",
  getJobTextAdsByUserIdAndCategory
);

// Route to get JobText ads by Category
router.get("/getAllJobTextAdsByCategory/:category", getAllJobTextAdsByCategory);

// Route to update JobText ad by userId
router.patch("/update/:userId", updateJobTextAdByUserIdAndAdId);

// Route to delete JobText ad by userId
router.delete("/delete/:userId/:adId", deleteJobTextAdByUserIdAndAdId);

export default router;
