import moment from "moment-timezone";
import { Admin } from "../../../models/admin/admin.model.js";
import { Astrologer } from "../../../models/astrologer/astroler.model.js";
import { User } from "../../../models/auth/user.model.js";
import { ChatRequest } from "../../../models/chatRequest/chatRequest.model.js";
import { generateTransactionId } from "../../../utils/generateTNX.js";

// Global intervals object to keep track of active intervals
const intervals = {};
const pausedIntervals = {};

// Function For deduct wallet balance from user
async function deductUserWallet(user, costPerMinute) {
  if (user.wallet.balance < costPerMinute) {
    return { success: false, message: "Insufficient funds" };
  }

  user.wallet.balance -= costPerMinute; // Deduct balance
  await user.save(); // Save user without adding a transaction every minute

  return { success: true };
}

async function creditAstrologerAndAdmin(astrologer, admin, totalCost, roomId) {
  const transactionId = generateTransactionId();

  const astrologerShare = (60 / 100) * totalCost;
  const adminShare = (40 / 100) * totalCost;

  astrologer.wallet.balance += astrologerShare;
  astrologer.total_earning += astrologerShare;
  astrologer.wallet.transactionHistory.push({
    timestamp: new Date(),
    type: "credit",
    credit_type: "chat",
    amount: astrologerShare,
    description: "Chat earnings",
    reference: `ChatRoom-${roomId}`,
    transactionId: transactionId,
  });
  await astrologer.save();

  admin.wallet.balance += adminShare;
  admin.wallet.transactionHistory.push({
    timestamp: new Date(),
    type: "credit",
    credit_type: "chat",
    amount: adminShare,
    description: "Chat commission",
    reference: `ChatRoom-${roomId}`,
  });
  await admin.save();
}

//==================================================================================================

const sessionSummary = {}; // Store temporary balances

export async function startChat(io, roomId, chatType, userId, astrologerId) {
  try {
    const astrologer = await Astrologer.findById(astrologerId);
    const user = await User.findById(userId);
    const admin = await Admin.findOne();

    if (!astrologer || !user || !admin) {
      io.to(roomId).emit("chat-error", {
        message: "Astrologer, User, or Admin not found",
      });
      return;
    }

    const costPerMinute = await getChatPrice(chatType, astrologerId);

    // Initialize session summary
    sessionSummary[roomId] = {
      totalDeducted: 0,
      totalAstrologerEarnings: 0,
      totalAdminEarnings: 0,
    };

    // First deduction
    const firstDeduction = await deductUserWallet(
      user,
      costPerMinute,
      roomId,
      chatType,
      astrologerId
    );
    if (!firstDeduction.success) {
      io.to(roomId).emit("chat-error", { message: firstDeduction.message });
      io.to(roomId).emit("chat-end", { reason: firstDeduction.message });
      astrologer.status = "available";
      await astrologer.save();
      return;
    }

    // Track totals instead of logging transactions
    sessionSummary[roomId].totalDeducted += costPerMinute;
    sessionSummary[roomId].totalAstrologerEarnings +=
      (60 / 100) * costPerMinute;
    sessionSummary[roomId].totalAdminEarnings += (40 / 100) * costPerMinute;

    let totalTime = 1;
    const interval = setInterval(async () => {
      try {
        const deductionResult = await deductUserWallet(
          user,
          costPerMinute,
          roomId,
          chatType,
          astrologerId
        );
        if (!deductionResult.success) {
          io.to(roomId).emit("chat-error", {
            message: deductionResult.message,
          });
          io.to(roomId).emit("chat-end", { reason: deductionResult.message });

          astrologer.status = "available";
          await astrologer.save();
          clearInterval(interval);
          delete intervals[roomId];
          return;
        }

        // Accumulate total deductions and earnings
        sessionSummary[roomId].totalDeducted += costPerMinute;
        sessionSummary[roomId].totalAstrologerEarnings +=
          (60 / 100) * costPerMinute;
        sessionSummary[roomId].totalAdminEarnings += (40 / 100) * costPerMinute;

        totalTime++;
        io.to(roomId).emit("chat-timer", {
          roomId,
          cost: costPerMinute,
          elapsedTime: totalTime,
        });
      } catch (error) {
        console.error("Error during interval execution:", error);
        io.to(roomId).emit("chat-error", {
          message: "An error occurred during chat billing",
        });
        clearInterval(interval);
        delete intervals[roomId];
      }
    }, 60000);

    intervals[roomId] = interval;
  } catch (error) {
    console.error("Error in startChat:", error);
    io.to(roomId).emit("chat-error", {
      message: "An error occurred during chat initialization",
    });
  }
}

// End chat and log transaction history once
export async function endChat(io, roomId, sender) {
  if (intervals[roomId]) {
    clearInterval(intervals[roomId]); // Stop the timer
    delete intervals[roomId];
  }

  const chatRequest = await ChatRequest.findOne({ roomId });
  if (!chatRequest) return;

  chatRequest.endTime = moment().format("DD-MM-YYYY hh:mm A");
  await chatRequest.save();

  // Retrieve accumulated totals
  const { totalDeducted, totalAstrologerEarnings, totalAdminEarnings } =
    sessionSummary[roomId] || {};

  if (totalDeducted > 0) {
    const transactionId = generateTransactionId();

    // Store only one transaction for the user
    await User.findByIdAndUpdate(chatRequest.userId, {
      $push: {
        "wallet.transactionHistory": {
          timestamp: new Date(),
          type: "debit",
          debit_type: "chat",
          amount: totalDeducted,
          description: `Total chat session with Astrologer ID: ${chatRequest.astrologerId}`,
          reference: `ChatRoom-${roomId}`,
          transactionId: transactionId,
        },
      },
    });

    // Store one transaction for the astrologer
    await Astrologer.findByIdAndUpdate(chatRequest.astrologerId, {
      $inc: {
        "wallet.balance": totalAstrologerEarnings,
        total_earning: totalAstrologerEarnings,
      },
      $push: {
        "wallet.transactionHistory": {
          timestamp: new Date(),
          type: "credit",
          credit_type: "chat",
          amount: totalAstrologerEarnings,
          description: "Total chat earnings",
          reference: `ChatRoom-${roomId}`,
          transactionId: transactionId,
        },
      },
    });

    // Store one transaction for the admin
    await Admin.findOneAndUpdate(
      {},
      {
        $inc: { "wallet.balance": totalAdminEarnings },
        $push: {
          "wallet.transactionHistory": {
            timestamp: new Date(),
            type: "credit",
            credit_type: "chat",
            amount: totalAdminEarnings,
            description: "Total chat commission",
            reference: `ChatRoom-${roomId}`,
            transactionId: transactionId,
          },
        },
      }
    );
  }

  // Emit chat end event
  io.to(roomId).emit("chat-end", {
    reason:
      sender === "user" ? "Chat ended by user" : "Chat ended by astrologer",
  });

  // Cleanup session data
  delete sessionSummary[roomId];
}

//==================================================================================================

// Function to pause chat billing
export function pauseChat(io, roomId) {
  if (intervals[roomId]) {
    clearInterval(intervals[roomId]); // Stop the timer
    pausedIntervals[roomId] = intervals[roomId];
    delete intervals[roomId];

    // Emit a notification to both user and astrologer
    io.to(roomId).emit("chat-paused", {
      message: "Chat has been paused",
    });
  }
}

// Function to resume chat billing
export function resumeChat(io, roomId, chatType, userId, astrologerId) {
  if (pausedIntervals[roomId]) {
    intervals[roomId] = pausedIntervals[roomId];
    delete pausedIntervals[roomId];

    // Emit a notification to both user and astrologer
    io.to(roomId).emit("chat-resumed", {
      message: "Chat has been resumed",
    });

    startChat(io, roomId, chatType, userId, astrologerId);
  }
}

// Function to start call billing
export async function startCall(io, roomId, callType, userId, astrologerId) {
  try {
    const astrologer = await Astrologer.findById(astrologerId);
    const user = await User.findById(userId);
    const admin = await Admin.findOne();

    if (!astrologer || !user || !admin) {
      io.to(roomId).emit("call-error", {
        message: "Astrologer, User, or Admin not found",
      });
      return;
    }

    const costPerMinute = await getChatPrice(callType, astrologerId);

    const firstDeduction = await deductUserWallet(
      user,
      costPerMinute,
      roomId,
      callType,
      astrologerId
    );

    if (!firstDeduction.success) {
      io.to(roomId).emit("call-error", {
        message: firstDeduction.message,
      });
      io.to(roomId).emit("call-end", { reason: firstDeduction.message });

      astrologer.status = "available";
      await astrologer.save();
      return;
    }

    await creditAstrologerAndAdmin(astrologer, admin, costPerMinute, roomId);

    let totalTime = 1;

    const interval = setInterval(async () => {
      try {
        const deductionResult = await deductUserWallet(
          user,
          costPerMinute,
          roomId,
          callType,
          astrologerId
        );

        if (!deductionResult.success) {
          io.to(roomId).emit("call-error", {
            message: deductionResult.message,
          });
          io.to(roomId).emit("call-end", { reason: deductionResult.message });

          astrologer.status = "available";
          await astrologer.save();
          clearInterval(interval);
          delete intervals[roomId];
          return;
        }

        await creditAstrologerAndAdmin(
          astrologer,
          admin,
          costPerMinute,
          roomId
        );

        totalTime++;
        io.to(roomId).emit("call-timer", {
          roomId,
          cost: costPerMinute,
          elapsedTime: totalTime,
        });
      } catch (error) {
        console.error("Error during interval execution:", error);
        io.to(roomId).emit("call-error", {
          message: "An error occurred during call billing",
        });
        clearInterval(interval);
        delete intervals[roomId];
      }
    }, 60000);

    intervals[roomId] = interval;
  } catch (error) {
    console.error("Error in startCall:", error);
    io.to(roomId).emit("call-error", {
      message: "An error occurred during call initialization",
    });
  }
}

// End call billing
export function endCall(io, roomId, sender) {
  if (intervals[roomId]) {
    clearInterval(intervals[roomId]); // Stop the timer
    delete intervals[roomId];
  }

  // Emit a notification to both user and astrologer
  io.to(roomId).emit("call-end", {
    reason:
      sender === "user" ? "Call ended by user" : "Call ended by astrologer",
  });
}

// Utility function to get chat price
export async function getChatPrice(chatType, astrologerId) {
  try {
    const astrologer = await Astrologer.findById(astrologerId);

    if (!astrologer) {
      throw new Error("Astrologer not found");
    }

    // Determine the price based on chat type
    switch (chatType) {
      case "text":
        return astrologer.chat_price;
      case "video":
        return astrologer.video_price;
      case "audio":
        return astrologer.call_price;
      default:
        throw new Error("Invalid chat type");
    }
  } catch (error) {
    console.error("Error fetching chat price:", error.message);
    throw new Error("Could not retrieve chat price");
  }
}
