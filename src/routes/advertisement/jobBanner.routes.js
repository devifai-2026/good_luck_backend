import express from "express";
import {
  createJobBannerAd,
  deleteJobBannerAdByUserIdAndAdId,
  getAllJobBannerAds,
  getAllJobBannerAdsByCategory,
  getJobBannerAdsByUserId,
  getJobBannerAdsByUserIdAndCategory,
  updateJobBannerAdByUserIdAndJobId,
} from "../../controllers/advertisement/jobBanner.controller.js";

const router = express.Router();

// Route to create a JobBanner ad and a corresponding ServiceAd
router.post("/create", createJobBannerAd);

// Route to get all JobBanner ads
router.get("/getAll", getAllJobBannerAds);

// Route to get JobBanner ads by userId
router.get("/getByUserId/:userId", getJobBannerAdsByUserId);

// Route to get JobBanner ads by userId and category
router.get("/getJobBannerAdsByUserIdAndCategory/:userId/:category", getJobBannerAdsByUserIdAndCategory);

// Route to get JobBanner ads by Category
router.get("/getJobBannerAdsByCategory/:category", getAllJobBannerAdsByCategory);

// Route to update JobBanner ad by userId
router.patch("/update/:userId", updateJobBannerAdByUserIdAndJobId);

// Route to delete JobBanner ad by userId
router.delete("/delete/:userId/:adId", deleteJobBannerAdByUserIdAndAdId);

export default router;
