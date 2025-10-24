import { HomeLandBanner } from "../../models/advertisement/homeLandBanner.model.js";
import { ServiceAds } from "../../models/advertisement/service.model.js";
import { User } from "../../models/auth/user.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import handleValidationError from "../../utils/validationError.js";

// Create a HomeBanner ad and a corresponding ServiceAd
export const createHomeLandBannerAd = async (req, res, next) => {
  const {
    userId,
    title,
    city,
    state,
    pincode,
    phone,
    price,
    banner_url,
    category,
  } = req.body;

  try {
    // Step 1: Find the user by userId
    const user = await User.findById(userId); // Find the user from the User collection
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Check if the user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is not verified"));
    }

    // Step 3: Check if the user has an active subscription
    if (!user.adSubscription || !user.adSubscription.isSubscribed) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "User does not have an active subscription to create ads"
          )
        );
    }

    // Step 4: Proceed with the creation of the HomeBannerAd
    const homeLandBannerAd = await HomeLandBanner.create({
      userId,
      title,
      city,
      state,
      pincode,
      phone: phone || user.phone,
      price,
      banner_url,
      category,
    });

    // Step 5: Create the corresponding ServiceAd
    const serviceAd = await ServiceAds.create({
      userId,
      homeAdType: "HomeLandBanner",
      homeLandAdId: homeLandBannerAd._id,
      jobAdType: null,
      job_ads: null,
      generale_ads: null,
    });

    // Step 6: Add the ad ID to the user's adSubscription adsDetails
    user.adSubscription.adsDetails.push({
      adType: "HomeLandBanner",
      adId: homeLandBannerAd._id,
      details: {
        title,
        city,
        state,
        pincode,
        phone: phone || user.phone,
        price,
        banner_url,
        category,
      },
    });

    // Save the updated user
    await user.save();

    // Step 7: Return the success response
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { homeLandBannerAd, serviceAd },
          "Ad created successfully and added to subscription details"
        )
      );
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = handleValidationError(error);
      res
        .status(400)
        .json(new ApiResponse(400, { errors }, "Validation error occurred"));
    } else {
      next(error); // Pass other errors to the error handling middleware
    }
  }
};

// Get all HomeBanner ads
export const getAllHomeLandBannerAds = async (req, res, next) => {
  try {
    const homeLandBannerAds = await HomeLandBanner.find();
    res
      .status(200)
      .json(
        new ApiResponse(200, homeLandBannerAds, "Fetched ads successfully")
      );
  } catch (error) {
    next(error);
  }
};

// Get HomeBanner ads by userId
export const getHomeLandBannerAdsByUserId = async (req, res, next) => {
  const { userId } = req.params;
  try {
    // Step 1: Find the user by userId
    const user = await User.findById(userId); // Find the user from the User collection
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: If user is found, fetch the HomeBanner ads for that user
    const homeLandBannerAds = await HomeLandBanner.find({ userId });
    // Step 3: Return the success response
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          homeLandBannerAds,
          `Fetched ads for userId: ${userId}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get HomeLandBanner ads by userId and category (Home/Land)
export const getHomeLandBannerAdsByUserIdAndCategory = async (
  req,
  res,
  next
) => {
  const { userId, category } = req.params;

  try {
    // Step 1: Validate category
    if (!["Home", "Land"].includes(category)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid category. Must be 'Home' or 'Land'."
          )
        );
    }

    // Step 2: Find the user by userId
    const user = await User.findById(userId); // Find the user from the User collection
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 3: Fetch the HomeLandBanner ads for that user and category
    const homeLandBannerAds = await HomeLandBanner.find({
      userId,
      category,
    });

    // Step 4: Check if any ads are found
    if (homeLandBannerAds.length === 0) {
      // If no ads found, send null as the data
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            `No ads found for userId: ${userId} and category: ${category}`
          )
        );
    }

    // Step 5: Return the success response with the ads if found
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          homeLandBannerAds,
          `Fetched ads for userId: ${userId} and category: ${category}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get all HomeLandBanner ads by category (Home/Land)
export const getAllHomeLandBannersByCategory = async (req, res, next) => {
  const { category } = req.params;

  try {
    // Step 1: Validate category
    if (!["Home", "Land"].includes(category)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid category. Must be 'Home' or 'Land'."
          )
        );
    }

    // Step 2: Fetch all HomeLandBanner ads for the given category
    const banners = await HomeLandBanner.find({ category });

    // Step 3: Check if any ads are found
    if (banners.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, `No ads found for category: ${category}`)
        );
    }

    // Step 4: Return the success response with the banners
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          banners,
          `Fetched all ads for category: ${category}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Update HomeBanner ad by userId and homeLandAdId (from req.body)
export const updateHomeLandBannerAdByUserIdAndAdId = async (req, res, next) => {
  const { userId } = req.params;
  const { adId, ...updateData } = req.body; // Extract homeLandAdId and updateData from req.body

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Update the HomeBanner ad using userId and homeLandAdId
    const homeLandBannerAd = await HomeLandBanner.findOneAndUpdate(
      { userId, _id: adId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!homeLandBannerAd) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `No HomeLandBanner ad found for userId: ${userId} and adId: ${adId}`
          )
        );
    }

    // Step 3: Optionally update ServiceAds if relevant
    if (updateData.homeAdType || updateData.homeLandAdId) {
      await ServiceAds.updateOne(
        { userId, homeLandAdId: homeLandBannerAd._id },
        { homeAdType: "HomeLandBanner", homeLandAdId: homeLandBannerAd._id }
      );
    }

    // Step 4: Respond with success
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          homeLandBannerAd,
          "HomeLandBanner ad updated successfully"
        )
      );
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            handleValidationError(error),
            "Validation error occurred"
          )
        );
    }
    next(error);
  }
};

// Delete HomeBanner ad by userId and adId
export const deleteHomeLandBannerAdByUserIdAndAdId = async (req, res, next) => {
  const { userId, adId } = req.params;

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Find the HomeLandBanner ad using userId and adId
    const homeLandBannerAd = await HomeLandBanner.findOneAndDelete({
      userId,
      _id: adId,
    });

    if (!homeLandBannerAd) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `No HomeLandBanner ad found for userId: ${userId} and adId: ${adId}`
          )
        );
    }

    // Step 3: Delete the corresponding ServiceAd
    await ServiceAds.deleteOne({ userId, homeLandAdId: homeLandBannerAd._id });

    // Step 4: Return the success response
    res
      .status(200)
      .json(new ApiResponse(200, homeLandBannerAd, "Ad deleted successfully"));
  } catch (error) {
    next(error);
  }
};
