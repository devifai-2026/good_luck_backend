import { HomeLandText } from "../../models/advertisement/homeLandText.model.js";
import { ServiceAds } from "../../models/advertisement/service.model.js";
import { User } from "../../models/auth/user.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import handleValidationError from "../../utils/validationError.js";
import {
  activeAdFilter,
  buildAdminAdValidityFields,
  createAdWithCredit,
  isEditWindowOpen,
  stripProtectedAdFields,
  withAdMeta,
  withAdMetaList,
} from "../../utils/adValidity.js";

// Create a HomeText ad and a corresponding ServiceAd
export const createHomeLandTextAd = async (req, res, next) => {
  const {
    userId,
    title,
    city,
    state,
    pincode,
    phone,
    price,
    text_ad_description,
    total_character,
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
    const homeLandTextAd = await createAdWithCredit({
      userId,
      adType: "HomeLandText",
      createAd: (validityFields) =>
        HomeLandText.create({
          userId,
          title,
          city,
          state,
          pincode,
          phone: phone || user.phone, // Use user's phone if not provided
          price,
          text_ad_description,
          total_character,
          category,
          ...validityFields,
        }),
    });

    if (!homeLandTextAd) {
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
      homeAdType: "HomeLandText",
      homeLandAdId: homeLandTextAd._id,
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
          { homeLandTextAd, serviceAd },
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

// Get all HomeText ads
export const getAllHomeLandTextAds = async (req, res, next) => {
  try {
    const homeLandTextAds = withAdMetaList(await HomeLandText.find(activeAdFilter()));
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          homeLandTextAds.length > 0 ? homeLandTextAds : [],
          "Fetched all ads successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get HomeText ads by userId
export const getHomeLandTextAdsByUserId = async (req, res, next) => {
  const { userId } = req.params;
  try {
    // Step 1: Find the user by userId
    const user = await User.findById(userId); // Find the user from the User collection
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Fetch HomeText ads for the user
    const homeLandTextAds = withAdMetaList(await HomeLandText.find({ ...activeAdFilter(), userId }));

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          homeLandTextAds,
          `Fetched ads for userId: ${userId}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get HomeLandText ads by userId and category (Home/Land)
export const getHomeLandTextAdsByUserIdAndCategory = async (req, res, next) => {
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

    // Step 3: Fetch the HomeLandText ads for that user and category
    const homeLandTextAds = withAdMetaList(await HomeLandText.find({ ...activeAdFilter(), userId, category }));

    // Step 4: Check if any ads are found
    if (homeLandTextAds.length === 0) {
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
          homeLandTextAds,
          `Fetched ads for userId: ${userId} and category: ${category}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get all HomeLandText ads by category (Home/Land)
export const getAllHomeLandTextAdsByCategory = async (req, res, next) => {
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

    // Step 2: Fetch all HomeLandText ads for the given category
    const textAds = withAdMetaList(await HomeLandText.find({ ...activeAdFilter(), category }));

    // Step 3: Check if any ads are found
    if (textAds.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, `No ads found for category: ${category}`)
        );
    }

    // Step 4: Return the success response with the text ads
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          textAds,
          `Fetched all text ads for category: ${category}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Update HomeText ad by userId and homeLandAdId (from req.body)
export const updateHomeLandTextAdByUserIdAndAdId = async (req, res, next) => {
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
    const existingAd = await HomeLandText.findOne({ userId, _id: adId });
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

    // Step 2: Update the HomeText ad using userId and homeLandAdId
    const homeLandTextAd = await HomeLandText.findOneAndUpdate(
      { userId, _id: adId },
      updateData,
      { new: true, runValidators: true } // Return the updated document and validate the update
    );

    if (!homeLandTextAd) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `No HomeLandText ad found for userId: ${userId} and adId: ${adId}`
          )
        );
    }

    // Step 3: Optionally update ServiceAds if relevant
    if (updateData.homeAdType || updateData.homeLandAdId) {
      await ServiceAds.updateOne(
        { userId, homeLandAdId: homeLandTextAd._id },
        { homeAdType: "HomeLandText", homeLandAdId: homeLandTextAd._id }
      );
    }

    // Step 4: Respond with success
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          withAdMeta(homeLandTextAd),
          "HomeLandText ad updated successfully"
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

// Delete HomeText ad by userId and adId
export const deleteHomeLandTextAdByUserIdAndAdId = async (req, res, next) => {
  const { userId, adId } = req.params;

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Find the HomeLandText ad using userId and adId
    const homeLandTextAd = await HomeLandText.findOneAndDelete({
      userId,
      _id: adId,
    });

    if (!homeLandTextAd) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `No HomeLandText ad found for userId: ${userId} and adId: ${adId}`
          )
        );
    }

    // Step 3: Delete the corresponding ServiceAd
    await ServiceAds.deleteOne({ userId, homeLandAdId: homeLandTextAd._id });

    // Step 4: Return the success response
    res
      .status(200)
      .json(new ApiResponse(200, homeLandTextAd, "Ad deleted successfully"));
  } catch (error) {
    next(error);
  }
};

// Admin panel: post a text ad without payment, with a fixed 1-month validity
export const adminCreateHomeLandTextAd = async (req, res, next) => {
  const {
    userId,
    title,
    city,
    state,
    pincode,
    phone,
    price,
    text_ad_description,
    total_character,
    category,
  } = req.body;

  try {
    const homeLandTextAd = await HomeLandText.create({
      userId,
      title,
      city,
      state,
      pincode,
      phone,
      price,
      text_ad_description,
      total_character,
      category,
      ...buildAdminAdValidityFields(1),
    });

    const serviceAd = await ServiceAds.create({
      userId,
      homeAdType: "HomeLandText",
      homeLandAdId: homeLandTextAd._id,
      jobAdType: null,
      job_ads: null,
      generale_ads: null,
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { homeLandTextAd, serviceAd },
          "Ad created successfully"
        )
      );
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = handleValidationError(error);
      res
        .status(400)
        .json(new ApiResponse(400, { errors }, "Validation error occurred"));
    } else {
      next(error);
    }
  }
};

// Admin panel: edit any text ad — not limited by the owner's 24h edit window
export const adminUpdateHomeLandTextAd = async (req, res, next) => {
  const { adId, ...body } = req.body;

  try {
    const homeLandTextAd = await HomeLandText.findByIdAndUpdate(
      adId,
      stripProtectedAdFields(body),
      { new: true, runValidators: true }
    );

    if (!homeLandTextAd) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, `No HomeLandText ad found for adId: ${adId}`));
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          withAdMeta(homeLandTextAd),
          "HomeLandText ad updated successfully"
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
