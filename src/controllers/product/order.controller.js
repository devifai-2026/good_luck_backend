import { Admin } from "../../models/admin/admin.model.js";
import AffiliateMarketer from "../../models/affiliateMarketer/affiliateMarketer.model.js";
import { Astrologer } from "../../models/astrologer/astroler.model.js";
import { User } from "../../models/auth/user.model.js";
import CommissionHistory from "../../models/commission/commission.model.js";
import Order, { ORDER_STATUSES } from "../../models/product/order.model.js";
import Product from "../../models/product/product.model.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { generateTransactionId } from "../../utils/generateTNX.js";
import { getIO } from "../../socket.js";
import sendNotification from "../../utils/onesignal.js";

// Create Order
export const createOrder = asyncHandler(async (req, res) => {
  try {
    const {
      userId,
      name,
      city,
      state,
      phone,
      order_details,
      delivery_date,
      quantity,
      total_price,
      payment_method,
      is_payment_done,
      transaction_id,
      promo_code,
      isSuperNoteApplied = false,
    } = req.body;

    const requiredFields = [
      { name: "name", message: "Name is required" },
      { name: "city", message: "City name is required" },
      { name: "state", message: "State description is required" },
      {
        name: "order_details",
        message: "Order details(Product id) are required",
      },
      { name: "total_price", message: "Total price is required" },
      { name: "payment_method", message: "Payment method is required" },
    ];

    for (const field of requiredFields) {
      if (!req.body[field.name]) {
        return res.status(400).json(new ApiResponse(400, null, field.message));
      }
    }

    const user = await User.findById(userId);
    const product = await Product.findById(order_details);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Generate transaction ID if not provided
    const finalTransactionId = transaction_id || generateTransactionId();

    let commission = 0;
    let promoUser = null;
    let promoterType = null;

    // Create order first
    const newOrder = new Order({
      userId,
      name,
      city,
      state,
      phone,
      order_details,
      delivery_date,
      quantity,
      total_price,
      payment_method,
      is_payment_done,
      transaction_id: finalTransactionId,
      isPromoCodeApplied: promo_code !== undefined,
      isSuperNoteApplied,
      status: "placed",
      status_history: [{ status: "placed", note: "Order placed" }],
    });

    await newOrder.save();

    if (promo_code) {
      // Check if the promo code belongs to an astrologer
      promoUser = await Astrologer.findOne({ promo_code });
      if (promoUser) {
        promoterType = "Astrologer";
      } else {
        // Check if the promo code belongs to an affiliate marketer
        promoUser = await AffiliateMarketer.findOne({ promo_code });
        if (promoUser) {
          promoterType = "AffiliateMarketer";
        }
      }

      if (!promoUser) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Promo code is not available"));
      }

      commission = total_price * 0.3; // 30% commission

      // Update promoter's wallet
      promoUser.wallet.balance += commission;
      promoUser.wallet.transactionHistory.push({
        transactionId: finalTransactionId,
        timestamp: Date.now(),
        type: "credit",
        credit_type: "Ecom",
        amount: commission,
        description: "Commission for order",
      });
      await promoUser.save();

      // ✅ Create Commission History Record
      const commissionHistory = new CommissionHistory({
        promoterId: promoUser._id,
        promoterType: promoterType,
        orderId: newOrder._id,
        userId: userId,
        productId: order_details,
        promoCode: promo_code,
        orderAmount: total_price,
        commissionAmount: commission,
        commissionPercentage: 30,
        transactionId: finalTransactionId,
        orderDate: new Date(),
        status: "credited",
      });

      await commissionHistory.save();
      console.log("Commission History created:", commissionHistory);
    }

    // Add the remaining amount to the admin wallet
    const admin = await Admin.findOne();
    const adminCommission = total_price - commission;
    admin.wallet.balance += adminCommission;
    admin.wallet.transactionHistory.push({
      transactionId: finalTransactionId,
      timestamp: Date.now(),
      type: "credit",
      credit_type: "Ecom",
      amount: adminCommission,
      description: "Admin commission for order",
    });
    await admin.save();

    // Add transaction to user's wallet history
    user.wallet.transactionHistory.push({
      transactionId: finalTransactionId,
      timestamp: Date.now(),
      type: "debit",
      debit_type: "Ecom",
      amount: total_price,
      description: "Payment for order",
    });
    // Credit the amount actually paid as Super Note
    user.superNote = (Number(user.superNote) || 0) + Number(total_price);
    await user.save();

    // Populate the order data for response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("order_details")
      .populate("userId", "Fname Lname phone");

    // Notify admin panel via Socket.IO
    try {
      const io = getIO();
      io.to("admin_room").emit("new_order", {
        orderId: populatedOrder._id,
        customerName: name,
        productName: populatedOrder.order_details?.productName || "Product",
        totalPrice: total_price,
        paymentMethod: payment_method,
        timestamp: new Date(),
      });
    } catch (socketErr) {
      console.warn("Socket notification failed:", socketErr.message);
    }

    return res
      .status(201)
      .json(new ApiResponse(201, populatedOrder, "Order created successfully"));
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error", error.message));
  }
});

// Get All Orders
export const getAllOrders = asyncHandler(async (req, res) => {
  try {
    // Orders created before the status field existed: derive it once from
    // is_order_complete so they don't all show up as "placed".
    await Order.updateMany(
      { status: { $exists: false }, is_order_complete: true },
      { $set: { status: "delivered" } }
    );
    await Order.updateMany(
      { status: { $exists: false } },
      { $set: { status: "placed" } }
    );

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("order_details")
      .populate("userId");

    if (!orders || orders.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No orders found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Get Order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("order_details")
      .populate("userId");

    if (!order) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Order not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order retrieved successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Get Orders by User ID
export const getOrdersByUserId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find orders for the given userId
    const orders = await Order.find({ userId: id })
      .populate("order_details")
      .populate("userId");

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Update Order by ID
export const updateOrderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      city,
      state,
      phone,
      delivery_date,
      quantity,
      total_price,
      payment_method,
      is_order_complete,
      is_payment_done,
      transaction_id,
    } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        city,
        state,
        phone,
        delivery_date,
        quantity,
        total_price,
        payment_method,
        is_order_complete,
        is_payment_done,
        transaction_id,
      },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Order not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedOrder, "Order updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const STATUS_LABELS = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Admin: manually move an order to a new fulfilment status (with optional
// courier tracking id / delivery date / note). Every change is appended to
// status_history and the customer gets a push notification.
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note, tracking_id, delivery_date } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          null,
          `Invalid status. Allowed: ${ORDER_STATUSES.join(", ")}`
        )
      );
  }

  const order = await Order.findById(id).populate("order_details");
  if (!order) {
    return res.status(404).json(new ApiResponse(404, null, "Order not found"));
  }

  const statusChanged = order.status !== status;

  order.status = status;
  order.is_order_complete = status === "delivered";
  if (tracking_id !== undefined) order.tracking_id = tracking_id || null;
  if (delivery_date) order.delivery_date = delivery_date;

  if (statusChanged || note) {
    order.status_history.push({ status, note: note || "" });
  }

  await order.save();

  if (statusChanged && order.userId) {
    const user = await User.findById(order.userId).select("phone");
    if (user?.phone) {
      const productName = order.order_details?.productName || "order";
      // Fire-and-forget: a push failure must not fail the admin's update.
      sendNotification(
        user.phone,
        `Order ${STATUS_LABELS[status]}`,
        `Your ${productName} order is now ${STATUS_LABELS[status].toLowerCase()}.${
          note ? ` ${note}` : ""
        }`
      );
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// // Cancel Order
// export const cancelOrder = asyncHandler(async (req, res) => {
//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id);

//     if (!order) {
//       return res
//         .status(404)
//         .json(new ApiResponse(404, null, "Order not found"));
//     }

//     if (order.is_order_complete) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "Cannot cancel a completed order"));
//     }

//     order.cancel_order.isCancel = true;
//     order.cancel_order.cancel_date_time = new Date();
//     await order.save();

//     return res
//       .status(200)
//       .json(new ApiResponse(200, order, "Order canceled successfully"));
//   } catch (error) {
//     throw new ApiError(500, error.message);
//   }
// });

// Delete Order
export const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Order not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Order deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
