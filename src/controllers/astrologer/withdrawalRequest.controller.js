import { Astrologer } from "../../models/astrologer/astroler.model.js";
import { WithdrawalRequest } from "../../models/withdraw/withdrawalRequest.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a withdrawal request
export const createWithdrawalRequest = asyncHandler(async (req, res) => {
  const { astrologerId, amount } = req.body;
  console.log(req.body);

  // Validate astrologerId
  if (!astrologerId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Astrologer ID is required"));
  }

  // Validate amount
  if (!amount || amount <= 500) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Amount must be greater than 500"));
  }

  // Check if astrologer exists
  const astrologer = await Astrologer.findById(astrologerId);
  if (!astrologer) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Astrologer not found"));
  }

  // Check wallet balance
  if (astrologer.wallet.balance < amount) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Insufficient wallet balance"));
  }

  await astrologer.save();

  // Create withdrawal request
  const withdrawalRequest = await WithdrawalRequest.create({
    astrologerId,
    amount,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        withdrawalRequest,
        "Withdrawal request created successfully"
      )
    );
});

// Get All Withdrawal Requests
export const getAllWithdrawalRequests = asyncHandler(async (req, res) => {
  const withdrawalRequests = await WithdrawalRequest.find();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        withdrawalRequests,
        "Withdrawal requests fetched successfully"
      )
    );
});

// Get Withdrawal Request By ID
export const getWithdrawalRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const withdrawalRequest = await WithdrawalRequest.findById(id);
  if (!withdrawalRequest) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Withdrawal request not found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        withdrawalRequest,
        "Withdrawal request fetched successfully"
      )
    );
});

// Get Withdrawal Requests By Astrologer ID
export const getWithdrawalRequestsByAstrologerId = asyncHandler(
  async (req, res) => {
    const { astrologerId } = req.params;
    console.log(req.params);

    const withdrawalRequests = await WithdrawalRequest.find({ astrologerId });
    if (!withdrawalRequests.length) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "No withdrawal requests found for this astrologer"
          )
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          withdrawalRequests,
          "Withdrawal requests fetched successfully"
        )
      );
  }
);

// Update Withdrawal Request Status
export const updateWithdrawalRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Example: `status` field for approval/rejection

  // Find the withdrawal request
  const withdrawalRequest =
    await WithdrawalRequest.findById(id).populate("astrologerId");
  if (!withdrawalRequest) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Withdrawal request not found"));
  }

  // Check if the status is being changed to 'approved'
  if (status === "approved") {
    const astrologer = withdrawalRequest.astrologerId;

    // Ensure the astrologer exists and has sufficient balance
    if (!astrologer) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Astrologer not found"));
    }

    if (astrologer.wallet.balance < withdrawalRequest.amount) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Insufficient wallet balance"));
    }

    // Deduct the withdrawal amount from the astrologer's wallet balance
    astrologer.wallet.balance -= withdrawalRequest.amount;
    await astrologer.save();

    // Update the processedAt timestamp
    withdrawalRequest.processedAt = new Date();
  }

  // Update the status of the withdrawal request
  withdrawalRequest.status = status || withdrawalRequest.status;
  await withdrawalRequest.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        withdrawalRequest,
        "Withdrawal request updated successfully"
      )
    );
});

// Delete Withdrawal Request By ID
export const deleteWithdrawalRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const withdrawalRequest = await WithdrawalRequest.findById(id);
  if (!withdrawalRequest) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Withdrawal request not found"));
  }

  await withdrawalRequest.remove();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "Withdrawal request deleted successfully")
    );
});
