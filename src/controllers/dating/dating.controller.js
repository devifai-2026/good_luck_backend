import mongoose from "mongoose";
import { User } from "../../models/auth/user.model.js";
import { Dating } from "../../models/dating/dating.model.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { MatchedProfileDating } from "../../models/dating/matchedProfileDating.model.js";

// Create Dating Profile
export const createDatingProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const {
      Fname, // Add Fname
      Lname, // Add Lname
      photos,
      city,
      phone,
      state,
      age,
      bio,
      smoker,
      alcoholic,
      education,
      orientation,
      interests,
      looking_for,
    } = req.body;

    const existsUser = await User.findById(id);

    if (!existsUser) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Check if the user has an active matrimony subscription
    // const { datingSubscription } = existsUser;
    // const currentDate = new Date();

    // if (
    //   !datingSubscription ||
    //   !datingSubscription.isSubscribed ||
    //   datingSubscription.endDate < currentDate
    // ) {
    //   return res
    //     .status(403)
    //     .json(
    //       new ApiResponse(
    //         403,
    //         null,
    //         "User must have an active dating subscription to create a dating profile"
    //       )
    //     );
    // }

    const existingDatingProfile = await Dating.findOne({ userId: id });

    if (existingDatingProfile) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Dating profile already exists"));
    }

    const { isAstrologer, isAffiliate_marketer, isAdmin } = existsUser;

    if (!isAstrologer && !isAffiliate_marketer && !isAdmin) {
      const newDatingProfile = new Dating({
        authId: existsUser.authId,
        userId: existsUser._id,
        Fname, // Add Fname
        Lname, // Add Lname
        photos,
        phone: existsUser.phone || phone,
        city,
        age,
        state,
        bio,
        smoker,
        alcoholic,
        education,
        orientation,
        interests,
        looking_for,
        isVerified: true,
      });
      // console.log(newDatingProfile);

      await newDatingProfile.save();

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            newDatingProfile,
            "Dating profile created successfully"
          )
        );
    } else {
      return res
        .status(403)
        .json(
          new ApiResponse(403, null, "This user cannot create a dating profile")
        );
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Validation error", errorMessages));
    }
    return res
      .status(500)
      .json(new ApiResponse(500, null, "An unexpected error occurred"));
  }
});

// Get All Dating Profiles
export const getAllProfiles = asyncHandler(async (req, res) => {
  try {
    // Fetch all dating profiles
    const allProfiles = await Dating.find();

    // Check if profiles exist
    if (!allProfiles || allProfiles.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No dating profiles found"));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allProfiles,
          "Dating profiles retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Get All Dating Profiles
export const getAllDatingProfiles = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params; // Current user's ID

    // Fetch the current user's dating profile
    const currentUserProfile = await Dating.findOne({ userId: id });

    if (!currentUserProfile) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Current user profile not found"));
    }

    // Get the list of profiles the user has already liked
    const sentLikes = currentUserProfile.sent_likes_id || [];

    // Fetch all dating profiles excluding the current user's profile
    const datingProfiles = await Dating.find({
      userId: { $ne: id }, // Exclude the current user's own profile
      looking_for: "male", // Ensure the profile is looking for males
    });

    if (!datingProfiles.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No dating profiles found"));
    }

    // Filter out profiles the user has already liked
    const filteredDatingProfiles = datingProfiles.filter((profile) => {
      return (
        !sentLikes.includes(profile.userId) && // Exclude profiles the user has already liked
        !profile.pending_likes_id.includes(id) // Exclude profiles where the user's ID is in their pending_likes_id
      );
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          filteredDatingProfiles,
          "Dating profiles retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Get Single Dating Profile by ID
export const getDatingProfileByUserId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const datingProfile = await Dating.findOne({ userId: id });

    if (!datingProfile) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Dating profile not found"));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          datingProfile,
          "Dating profile retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

// Update Dating Profile
export const updateDatingProfileByUserId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProfile = await Dating.findOneAndUpdate(
      { userId: id },
      req.body,
      { new: true, runValidators: true }
    );

    console.log(updatedProfile, req.body);

    if (!updatedProfile) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Dating profile not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProfile,
          "Dating profile updated successfully"
        )
      );
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Validation error", errorMessages));
    }
    return res
      .status(500)
      .json(new ApiResponse(500, null, "An unexpected error occurred"));
  }
});

// Get Random Male Profiles
export const getRandomMaleProfiles = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params; // Assuming userId is passed as a parameter

    // Fetch the user's data to get their sent_likes_id and pending_likes_id
    const user = await Dating.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        data: null,
        message: "User not found",
        success: false,
        errors: null,
      });
    }

    const sentLikes = user.sent_likes_id || [];
    const pendingLikes = user.pending_likes_id || [];

    // Aggregate to fetch random profiles
    const randomProfiles = await Dating.aggregate([
      {
        $match: {
          userId: { $nin: sentLikes }, // Exclude profiles the user has already liked
          _id: { $ne: user._id }, // Exclude the current user's own profile
          pending_likes_id: { $nin: [userId] }, // Exclude profiles where the user's ID is in their pending_likes_id
          looking_for: "male", // Ensure the profile is looking for males
        },
      },
      { $sample: { size: 5 } }, // Randomly pick 5 profiles
    ]);

    return res.status(200).json({
      statusCode: 200,
      data: randomProfiles,
      message: "Random male profiles retrieved successfully",
      success: true,
      errors: null,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      data: null,
      message: error.message || "An error occurred",
      success: false,
      errors: error,
    });
  }
});

// Get Random Female Profiles
export const getRandomFemaleProfiles = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params; // Assuming userId is available in req.user

    // Retrieve the user’s liked profiles
    const user = await Dating.findOne({ userId });

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const sentLikes = user.sent_likes_id || [];
    const pendingLikes = user.pending_likes_id || [];

    // Get random female profiles excluding already liked profiles
    const randomFemaleProfiles = await Dating.aggregate([
      {
        $match: {
          _id: { $nin: sentLikes }, // Exclude profiles already liked
          _id: { $ne: user._id }, // Exclude the current user's own profile
          pending_likes_id: { $nin: [userId] }, // Exclude profiles where the user's ID is in their pending_likes_id
          looking_for: "female", // Ensure the profile is looking for females
        },
      },
      { $sample: { size: 5 } }, // Randomly pick up to 5 profiles
    ]);

    if (randomFemaleProfiles.length === 0) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "No female profiles found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          randomFemaleProfiles,
          "Random female profiles retrieved successfully"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "An unexpected error occurred"));
  }
});

// Send Like API for Dating Profile with senderId and receiverId from params
export const sendLikeDating = asyncHandler(async (req, res) => {
  const { senderId, receiverId } = req.params;
  console.log(senderId, receiverId);
  // Check if a match already exists in MatchedProfileDating
  const existingMatch = await MatchedProfileDating.findOne({
    $or: [
      { user1: senderId, user2: receiverId },
      { user1: receiverId, user2: senderId },
    ],
  });

  if (existingMatch) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "You are already matched with this profile!")
      );
  }

  // Fetch the sender's dating profile
  const senderProfile = await Dating.findOne({ userId: senderId });

  if (!senderProfile) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Sender profile not found"));
  }

  // Fetch the target profile's dating profile
  const targetProfile = await Dating.findOne({ userId: receiverId });

  if (!targetProfile) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Target profile not found"));
  }

  // Ensure sent_likes_id and pending_likes_id are arrays
  senderProfile.sent_likes_id = senderProfile.sent_likes_id || [];
  senderProfile.pending_likes_id = senderProfile.pending_likes_id || [];
  targetProfile.pending_likes_id = targetProfile.pending_likes_id || [];
  targetProfile.sent_likes_id = targetProfile.sent_likes_id || [];

  // Check if the receiverId is in the sender's pending_likes_id
  if (senderProfile.pending_likes_id.some((id) => id.equals(receiverId))) {
    // If the receiverId exists in pending_likes_id, it's a match
    senderProfile.pending_likes_id = senderProfile.pending_likes_id.filter(
      (id) => !id.equals(receiverId)
    );
    targetProfile.pending_likes_id = targetProfile.pending_likes_id.filter(
      (id) => !id.equals(senderId)
    );

    senderProfile.sent_likes_id.push(receiverId);
    targetProfile.sent_likes_id.push(senderId);

    // Save both profiles
    await senderProfile.save();
    await targetProfile.save();

    // Save the match to MatchedProfileDating
    await MatchedProfileDating.create({
      user1: senderId,
      user2: receiverId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { match: true },
          "You have matched with this profile!"
        )
      );
  }

  // Check if the like has already been sent
  if (senderProfile.sent_likes_id.includes(receiverId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Like already sent to this profile"));
  }

  // Add the sender to the target profile's pending likes
  targetProfile.pending_likes_id.push(senderId);
  await targetProfile.save();

  // Add the target profile's userId to the sender's sent_likes_id
  senderProfile.sent_likes_id.push(receiverId);
  await senderProfile.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { match: false }, "Like sent successfully"));
});

// Get Pending Likes Profiles API
export const getPendingLikesProfilesDating = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userProfile = await Dating.findOne({ userId });
  if (!userProfile) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User profile not found"));
  }

  const pendingLikes = userProfile.pending_likes_id || [];
  const sentLikes = userProfile.sent_likes_id || [];

  const filteredPendingLikes = pendingLikes.filter(
    (pendingLikeId) => !sentLikes.includes(pendingLikeId.toString())
  );

  if (filteredPendingLikes.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No pending likes left"));
  }

  console.log("Filtered Pending Likes:", filteredPendingLikes);

  try {
    const validObjectIds = filteredPendingLikes.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    console.log("Valid Object IDs:", validObjectIds);

    // Test query for both ObjectId and String
    const pendingProfiles = await Dating.find({
      $or: [
        { userId: { $in: validObjectIds } },
        { userId: { $in: validObjectIds.map((id) => id.toString()) } },
      ],
    }).select("userId Fname Lname photos city state age gender bio");
    console.log(pendingProfiles, "gettig profiles");

    if (pendingProfiles.length === 0) {
      console.log("No matching profiles found for query.");
      return res
        .status(200)
        .json(new ApiResponse(200, null, "No matching profiles found"));
    }

    console.log("Pending Profiles:", pendingProfiles);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          pendingProfiles,
          "Pending likes retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return res.status(500).json(new ApiResponse(500, null, "Server error"));
  }
});

// Get Sent Likes Profiles API
export const getSentLikesProfilesDating = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Fetch the user's dating profile
  const userProfile = await Dating.findOne({ userId });

  if (!userProfile) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User profile not found"));
  }

  // Get the sent likes (user IDs)
  const sentLikes = userProfile.sent_likes_id;

  if (sentLikes.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No sent likes found"));
  }

  // Fetch profiles of users to whom the current user has sent likes
  const sentProfiles = await Dating.find({ userId: { $in: sentLikes } }).select(
    "userId Fname Lname photos city state age gender bio"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sentProfiles,
        "Sent likes profiles retrieved successfully"
      )
    );
});

// Delete Dating Profile
export const deleteDatingProfileByUserId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the dating profile
    const deletedProfile = await Dating.findOneAndDelete({ userId: id });

    if (!deletedProfile) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Dating profile not found"));
    }

    res
      .status(200)
      .json(new ApiResponse(200, null, "Dating profile deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
