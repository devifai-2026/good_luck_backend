import express from "express";
import {
  getAstrologyPricing,
  updateAstrologyPricing,
} from "../../controllers/settings/astrologyPricing.controller.js";

const router = express.Router();

router.get("/get", getAstrologyPricing);
router.patch("/update", updateAstrologyPricing);

export default router;
