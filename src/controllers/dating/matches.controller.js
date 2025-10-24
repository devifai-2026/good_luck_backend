import { Chat } from "../../models/dating/chatModel.js";
import { Dating } from "../../models/dating/dating.model.js";
import { MatchedProfileDating } from "../../models/dating/matchedProfileDating.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getMatchesByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Extract userId from request params

  // Validate that userId is provided
  if (!userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User ID is required"));
  }

  // Fetch matched profiles where userId is either user1 or user2
  const matches = await MatchedProfileDating.find({
    $or: [{ user1: userId }, { user2: userId }],
    isActive: true, // Ensure the match is active
  }).exec();

  if (!matches || matches.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No matches found for this user"));
  }

  // Fetch data from Dating collection and the last message from Chat
  const matchData = await Promise.all(
    matches.map(async (match) => {
      // Identify the other user in the match
      const otherUserId =
        match.user1.toString() === userId ? match.user2 : match.user1;

      // Fetch the other user's details
      const otherUserData = await Dating.findOne({
        userId: otherUserId,
      }).select("userId Fname Lname photos city state bio interests");

      // Fetch the last message for the match
      const lastMessage = await Chat.findOne({ matchId: match._id })
        .select("messages")
        .sort({ "messages.timestamp": -1 })
        .limit(1)
        .exec();

      const lastMessageData =
        lastMessage?.messages?.length > 0
          ? lastMessage.messages[lastMessage.messages.length - 1]
          : null;

      return {
        matchId: match._id,
        otherUser: otherUserData || {}, // Only include the other user's details
        lastMessage: lastMessageData || null, // Include the last message
      };
    })
  );

  // Return matches with populated other user details and the last message in the response
  return res
    .status(200)
    .json(new ApiResponse(200, matchData, "Matches retrieved successfully"));
});
