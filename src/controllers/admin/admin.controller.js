import { Admin } from "../../models/admin/admin.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Get total balance
export const getAdminTotalBalance = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found"));
    }

    const formattedBalance = Math.round(admin.wallet.balance); // Remove decimals

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { balance: formattedBalance },
          "Total balance retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Get all transaction history
export const getAdminTransactionHistory = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);

    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found"));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { transactions: admin.wallet.transactionHistory },
          "Transaction history retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
