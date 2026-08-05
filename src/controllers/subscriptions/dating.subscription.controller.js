import { DatingSubscription } from "../../models/subscription/dating.subscription.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { applyTierUpdates } from "../../utils/tierSubscriptionHelpers.js";

// POST API to create/update the Silver/Gold/Platinum tier prices & features.
// isPremium/isTrusted are fixed per tier and are never accepted here.
export const createDatingSubscription = asyncHandler(async (req, res) => {
  let subscription = await DatingSubscription.findOne();

  if (!subscription) {
    subscription = new DatingSubscription({});
  }

  const updated = applyTierUpdates(subscription, req.body);

  if (!updated) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "At least one tier's price or features are required"));
  }

  await subscription.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "Subscription plans updated successfully"
      )
    );
});

// GET API to fetch dating subscription tiers (Silver/Gold/Platinum)
export const getDatingSubscription = asyncHandler(async (req, res) => {
  let subscription = await DatingSubscription.findOne();

  if (!subscription) {
    subscription = await DatingSubscription.create({});
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      subscription,
      "Subscription plans fetched successfully"
    )
  );
});

// Function to update Dating subscription tier prices/features
export const updateDatingSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  if (!subscriptionId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Subscription ID is required"));
  }

  const subscription = await DatingSubscription.findById(subscriptionId);

  if (!subscription) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Subscription not found"));
  }

  const updated = applyTierUpdates(subscription, req.body);

  if (!updated) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "At least one tier's price or features are required"));
  }

  await subscription.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "Subscription plans updated successfully"
      )
    );
});

// Function to delete a Dating subscription config document
export const deleteDatingSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  // Validate input
  if (!subscriptionId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Subscription ID is required"));
  }

  // Find the AdSubscription by ID and delete it
  const subscription =
    await DatingSubscription.findByIdAndDelete(subscriptionId);

  if (!subscription) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Subscription not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Subscription deleted successfully"));
});
