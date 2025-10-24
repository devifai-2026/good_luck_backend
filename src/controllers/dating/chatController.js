import mongoose from "mongoose";
import { Chat } from "../../models/dating/chatModel.js";
import { MatchedProfileDating } from "../../models/dating/matchedProfileDating.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// Function to create a chat for an already existing match
export const createChatForMatch = asyncHandler(async (req, res) => {
  const { user1, user2 } = req.body; // Extract user1 and user2 from request body

  // Check if both users are provided
  if (!user1 || !user2) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Both users are required"));
  }

  // Check if a match already exists between user1 and user2
  const existingMatch = await MatchedProfileDating.findOne({
    $or: [
      { user1: user1, user2: user2 },
      { user1: user2, user2: user1 },
    ],
  });

  if (!existingMatch) {
    return res.status(404).json(new ApiResponse(404, null, "Match not found"));
  }

  // Create a new chat document for the match
  const newChat = new Chat({
    matchId: existingMatch._id, // Set the matchId for the chat
    messages: [], // Initially no messages
  });

  // Save the new chat
  const savedChat = await newChat.save();

  // Update the match with the saved chatId
  existingMatch.chatId = savedChat._id;
  await existingMatch.save();

  // Return the updated match and chat details
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { match: existingMatch, chat: savedChat },
        "Chat created and linked to the match successfully"
      )
    );
});

// Function to fetch messages by matchId and userId
export const getMessagesByMatchAndUserId = asyncHandler(async (req, res) => {
  const { matchId, userId } = req.params; // Extract matchId and userId from route parameters

  if (!matchId || !userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Match ID and User ID are required"));
  }

  try {
    const matchObjectId = new mongoose.Types.ObjectId(matchId); // Convert matchId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert userId to ObjectId

    // Query the Chat model for a chat with the specified matchId
    const chat = await Chat.findOne({
      matchId: matchObjectId, // Match the matchId
    }).select("matchId messages"); // Select relevant fields

    if (!chat) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, "Chat not found for the specified matchId")
        );
    }

    // Filter messages involving the user
    const userMessages = chat.messages.filter(
      (msg) => String(msg.senderId) === userId
    );

    if (userMessages.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "No messages found for the user in this chat"
          )
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { matchId, messages: userMessages },
          "Messages retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching messages by matchId and userId:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Error retrieving messages"));
  }
});

// Function to fetch messages by matchId
export const getMessagesByMatchId = asyncHandler(async (req, res) => {
  const { matchId } = req.params; // Extract matchId from route parameters

  if (!matchId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Match ID is required"));
  }

  try {
    const matchObjectId = new mongoose.Types.ObjectId(matchId); // Convert matchId to ObjectId

    // Query the Chat model for a chat with the specified matchId
    const chat = await Chat.findOne({
      matchId: matchObjectId, // Match the matchId
    }).select("matchId messages"); // Select relevant fields

    if (!chat) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, "Chat not found for the specified matchId")
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { matchId, messages: chat.messages },
          "Messages retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching messages by matchId:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Error retrieving messages"));
  }
});
