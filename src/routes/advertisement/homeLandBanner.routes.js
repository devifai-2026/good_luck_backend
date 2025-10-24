import express from "express";
import {
  createHomeLandBannerAd,
  deleteHomeLandBannerAdByUserIdAndAdId,
  getAllHomeLandBannerAds,
  getAllHomeLandBannersByCategory,
  getHomeLandBannerAdsByUserId,
  getHomeLandBannerAdsByUserIdAndCategory,
  updateHomeLandBannerAdByUserIdAndAdId,
} from "../../controllers/advertisement/homeLandBanner.controller.js";

const router = express.Router();

// Route to create a HomeBanner ad and a corresponding ServiceAd
router.post("/create", createHomeLandBannerAd);

// Route to get all HomeBanner ads
router.get("/getAll", getAllHomeLandBannerAds);

// Route to get HomeBanner ads by userId
router.get("/getByUserId/:userId", getHomeLandBannerAdsByUserId);

// Route to get HomeBanner Or LandBanner ads by userId nad category
router.get(
  "/getByCategoryUserId/:userId/:category",
  getHomeLandBannerAdsByUserIdAndCategory
);

// Route to get HomeBanner Or LandBanner ads by userId nad category
router.get("/getByCategory/:category", getAllHomeLandBannersByCategory);

// Route to update HomeBanner ad by userId
router.patch("/update/:userId", updateHomeLandBannerAdByUserIdAndAdId);

// Route to delete HomeBanner ad by userId
router.delete("/delete/:userId/:adId", deleteHomeLandBannerAdByUserIdAndAdId);

export default router;
