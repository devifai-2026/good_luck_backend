import { HomeLandBanner } from "../../models/advertisement/homeLandBanner.model.js";
import { ServiceAds } from "../../models/advertisement/service.model.js";
import { User } from "../../models/auth/user.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import handleValidationError from "../../utils/validationError.js";
import {
  activeAdFilter,
  createAdWithCredit,
  isEditWindowOpen,
  stripProtectedAdFields,
  withAdMeta,
  withAdMetaList,
} from "../../utils/adValidity.js";

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

    // Step 3: Create the ad with one of the user's paid credits for this
    // category — the ad's validity comes from the plan that credit was
    // bought with. Every ad needs its own payment.
    const homeLandBannerAd = await createAdWithCredit({
      userId,
      adType: "HomeLandBanner",
      createAd: (validityFields) =>
        HomeLandBanner.create({
          userId,
          title,
          city,
          state,
          pincode,
          phone: phone || user.phone,
          price,
          banner_url,
          category,
          ...validityFields,
        }),
    });

    if (!homeLandBannerAd) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "Please purchase a plan to post this ad"
          )
        );
    }

    // Step 4: Create the corresponding ServiceAd
    const serviceAd = await ServiceAds.create({
      userId,
      homeAdType: "HomeLandBanner",
      homeLandAdId: homeLandBannerAd._id,
      jobAdType: null,
      job_ads: null,
      generale_ads: null,
    });

    // Step 5: Return the success response
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { homeLandBannerAd, serviceAd },
          "Ad created successfully"
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
    const homeLandBannerAds = withAdMetaList(await HomeLandBanner.find(activeAdFilter()));
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
    const homeLandBannerAds = withAdMetaList(await HomeLandBanner.find({ ...activeAdFilter(), userId }));
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
    const homeLandBannerAds = withAdMetaList(await HomeLandBanner.find({ ...activeAdFilter(), userId, category }));

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
    const banners = withAdMetaList(await HomeLandBanner.find({ ...activeAdFilter(), category }));

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
  const { adId, ...body } = req.body;
  const updateData = stripProtectedAdFields(body);

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Owners can edit an ad only within 24 hours of posting it
    const existingAd = await HomeLandBanner.findOne({ userId, _id: adId });
    if (existingAd && !isEditWindowOpen(existingAd)) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "Ads can only be edited within 24 hours of posting"
          )
        );
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
          withAdMeta(homeLandBannerAd),
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
