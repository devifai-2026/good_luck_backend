import { LocalSubscription } from "../../models/subscription/localserviceSubscription.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// POST API to update one_year_plan and one_month_plan prices
export const createLocalSubscription = asyncHandler(async (req, res) => {
  const { one_month_plan, one_year_plan } = req.body;

  // Validate input
  if (one_month_plan === undefined && one_year_plan === undefined) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "At least one price is required"));
  }

  // Find the LocalSubscription (assuming a single document in the collection)
  let subscription = await LocalSubscription.findOne();

  // If no LocalSubscription exists, create a new one
  if (!subscription) {
    subscription = new LocalSubscription({});
  }

  // Update the prices
  if (one_month_plan !== undefined)
    subscription.one_month_plan = one_month_plan;
  if (one_year_plan !== undefined) subscription.one_year_plan = one_year_plan;

  // Save the updated subscription
  await subscription.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "Subscription prices updated successfully"
      )
    );
});

// GET API to fetch local subscription prices
export const getLocalSubscription = asyncHandler(async (req, res) => {
  // Find the LocalSubscription (assuming a single document in the collection)
  const subscription = await LocalSubscription.findOne();

  // Check if a subscription document exists
  if (!subscription) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Subscription not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "Subscription prices fetched successfully"
      )
    );
});

// Function to update local subscription prices
export const updateLocalSubscription = asyncHandler(async (req, res) => {
  const { one_month_plan, one_year_plan } = req.body;
  const { subscriptionId } = req.params;
  // Validate input
  if (!subscriptionId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Subscription ID is required"));
  }

  if (one_month_plan === undefined && one_year_plan === undefined) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "At least one price is required"));
  }

  // Prepare the update object
  const updateData = {};
  if (one_month_plan !== undefined) updateData.one_month_plan = one_month_plan;
  if (one_year_plan !== undefined) updateData.one_year_plan = one_year_plan;

  // Find the LocalSubscription by ID and update it
  const subscription = await LocalSubscription.findByIdAndUpdate(
    subscriptionId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!subscription) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Subscription not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscription,
        "Subscription prices updated successfully"
      )
    );
});

// Function to delete a local subscription
export const deleteLocalSubscription = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;

  // Validate input
  if (!subscriptionId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Subscription ID is required"));
  }

  // Find the LocalSubscription by ID and delete it
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
