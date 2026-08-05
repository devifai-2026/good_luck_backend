import { LocalSubscription } from "../../models/subscription/localserviceSubscription.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { applyTierUpdates } from "../../utils/tierSubscriptionHelpers.js";

// POST API to create/update the Silver/Gold/Platinum tier prices & features.
// isPremium/isTrusted are fixed per tier and are never accepted here.
export const createLocalSubscription = asyncHandler(async (req, res) => {
  let subscription = await LocalSubscription.findOne();

  if (!subscription) {
    subscription = new LocalSubscription({});
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

// GET API to fetch local subscription tiers (Silver/Gold/Platinum)
export const getLocalSubscription = asyncHandler(async (req, res) => {
  let subscription = await LocalSubscription.findOne();

  // If no config exists yet, create one so the app always has tiers to show
  if (!subscription) {
    subscription = await LocalSubscription.create({});
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "Subscription plans fetched successfully"
      )
    );
});

// Function to update Local subscription tier prices/features
export const updateLocalSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  if (!subscriptionId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Subscription ID is required"));
  }

  const subscription = await LocalSubscription.findById(subscriptionId);

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

// Function to delete a Local subscription config document
export const deleteLocalSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  if (!subscriptionId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Subscription ID is required"));
  }

  const subscription =
    await LocalSubscription.findByIdAndDelete(subscriptionId);

  if (!subscription) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Subscription not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Subscription deleted successfully"));
});
