import { AstrologyPricing } from "../../models/settings/astrologyPricing.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getOrCreatePricing = async () => {
  let pricing = await AstrologyPricing.findOne();
  if (!pricing) {
    pricing = await AstrologyPricing.create({});
  }
  return pricing;
};

// Get Astrology Pricing (Matchmaking & Janam Kundali)
export const getAstrologyPricing = asyncHandler(async (req, res) => {
  const pricing = await getOrCreatePricing();

  return res
    .status(200)
    .json(new ApiResponse(200, pricing, "Astrology pricing retrieved successfully"));
});

// Update Astrology Pricing (Matchmaking & Janam Kundali)
export const updateAstrologyPricing = asyncHandler(async (req, res) => {
  const { matchmakingPrice, janamKundaliPrice } = req.body;

  if (matchmakingPrice === undefined && janamKundaliPrice === undefined) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "At least one price field is required"));
  }

  const pricing = await getOrCreatePricing();

  if (matchmakingPrice !== undefined) pricing.matchmakingPrice = matchmakingPrice;
  if (janamKundaliPrice !== undefined) pricing.janamKundaliPrice = janamKundaliPrice;

  await pricing.save();

  return res
    .status(200)
    .json(new ApiResponse(200, pricing, "Astrology pricing updated successfully"));
});
