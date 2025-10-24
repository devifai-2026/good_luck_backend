import Razorpay from "razorpay";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Create a new order
export const createOrders = asyncHandler(async (req, res, next) => {
  try {
    const { amount, currency, receipt, notes } = req.body; // Extract details from the request body

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID, // Razorpay Key ID from environment variable
      key_secret: process.env.RAZORPAY_KEY_SECRET, // Razorpay Key Secret from environment variable
    });

    // Create the order
    const options = {
      amount: amount * 100, // Amount in smallest currency unit (e.g., paise for INR)
      currency: currency || "INR", // Default to INR if no currency provided
      receipt: receipt || `receipt_${new Date().getTime()}`, // Default receipt ID if none provided
      notes: notes || {}, // Optional notes
    };

    const order = await razorpay.orders.create(options);

    // Send the order response
    res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));
  } catch (error) {
    // Log the error and send an appropriate error response
    console.error("Error creating order:", error);

    const statusCode = error.statusCode || 500;
    const message =
      error.error?.description || "An error occurred while creating the order";
    res
      .status(statusCode)
      .json(new ApiResponse(statusCode, null, message, error));
  }
});

// Fetch payment details by payment ID
export const getPaymentByPaymentId = asyncHandler(async (req, res, next) => {
  try {
    const { paymentId } = req.params; // Extract payment ID from request parameters

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID, // Razorpay Key ID from environment variable
      key_secret: process.env.RAZORPAY_KEY_SECRET, // Razorpay Key Secret from environment variable
    });

    // Fetch payment details
    const paymentDetails = await razorpay.payments.fetch(paymentId);

    // Respond with payment details
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          paymentDetails,
          "Payment details fetched successfully"
        )
      );
  } catch (error) {
    // Log the error and send an appropriate error response
    console.error("Error fetching payment details:", error);

    const statusCode = error.statusCode || 500;
    const message =
      error.error?.description ||
      "An error occurred while fetching payment details";
    res
      .status(statusCode)
      .json(new ApiResponse(statusCode, null, message, error));
  }
});
