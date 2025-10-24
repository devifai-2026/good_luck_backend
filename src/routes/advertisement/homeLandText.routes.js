import express from "express";
import {
  createHomeLandTextAd,
  deleteHomeLandTextAdByUserIdAndAdId,
  getAllHomeLandTextAds,
  getAllHomeLandTextAdsByCategory,
  getHomeLandTextAdsByUserId,
  getHomeLandTextAdsByUserIdAndCategory,
  updateHomeLandTextAdByUserIdAndAdId
} from "../../controllers/advertisement/homeLandText.controller.js";

const router = express.Router();

// Route to create a HomeText ad and a corresponding ServiceAd
router.post("/create", createHomeLandTextAd);

// Route to get all HomeText ads
router.get("/getAll", getAllHomeLandTextAds);

// Route to get HomeText ads by userId
router.get("/getByUserId/:userId", getHomeLandTextAdsByUserId);

// Route to get Home Or Land Text ads by userId nad category
router.get(
  "/getByCategoryUserId/:userId/:category",
  getHomeLandTextAdsByUserIdAndCategory
);

// Route to get Home Or Land Text ads by userId nad category
router.get(
  "/getByCategory/:category",
  getAllHomeLandTextAdsByCategory
);

// Route to update HomeText ad by userId
router.patch("/update/:userId", updateHomeLandTextAdByUserIdAndAdId);

// Route to delete HomeText ad by userId
router.delete("/delete/:userId/:adId", deleteHomeLandTextAdByUserIdAndAdId);

export default router;
