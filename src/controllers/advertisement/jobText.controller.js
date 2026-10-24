import { JobText } from "../../models/advertisement/jobText.model.js";
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

// Create a JobText ad and a corresponding ServiceAd
export const createJobTextAd = async (req, res, next) => {
  const {
    userId,
    title,
    salary,
    company_name,
    work_location,
    website,
    city,
    state,
    address,
    pincode,
    phone,
    text_ad_description,
    total_character,
    category,
  } = req.body;

  try {
    // Step 1: Validate user existence
    const user = await User.findById(userId);
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
    const jobTextAd = await createAdWithCredit({
      userId,
      adType: "JobText",
      createAd: (validityFields) =>
        JobText.create({
          userId,
          title,
          salary,
          company_name,
          work_location,
          website,
          city,
          state,
          address,
          pincode,
          phone: phone || user.phone, // Use user's phone if not provided
          text_ad_description,
          total_character,
          category,
          ...validityFields,
        }),
    });

    if (!jobTextAd) {
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

    // Step 4: Automatically create the ServiceAd
    const serviceAd = await ServiceAds.create({
      userId,
      jobAdType: "JobText",
      job_ad_id: jobTextAd._id,
      homeAdType: null,
      home_ads: null,
      generale_ads: null,
    });

    // Step 5: Respond with success
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { jobTextAd, serviceAd },
          "JobText and ServiceAd created successfully"
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

// Get all JobText ads
export const getAllJobTextAds = async (req, res, next) => {
  try {
    const jobTextAds = withAdMetaList(await JobText.find(activeAdFilter()));

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobTextAds.length > 0 ? jobTextAds : [],
          "Fetched all JobText ads successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get JobText ads by userId
export const getJobTextAdsByUserId = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const jobTextAds = withAdMetaList(await JobText.find({ ...activeAdFilter(), userId }));
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobTextAds,
          `Fetched JobText ads for userId: ${userId}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get JobText ads by userId and category (Govt/Private)
export const getJobTextAdsByUserIdAndCategory = async (req, res, next) => {
  const { userId, category } = req.params;

  try {
    // Step 1: Validate category
    if (!["Govt", "Private"].includes(category)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid category. Must be 'Govt' or 'Private'."
          )
        );
    }

    // Step 2: Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 3: Fetch JobText ads for the user and category
    const jobTextAds = withAdMetaList(await JobText.find({ ...activeAdFilter(), userId, category }));

    // Step 4: Check if any ads are found
    if (jobTextAds.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            `No JobText ads found for userId: ${userId} and category: ${category}`
          )
        );
    }

    // Step 5: Return the ads if found
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobTextAds,
          `Fetched JobText ads for userId: ${userId} and category: ${category}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get all JobText ads by category (Govt/Private)
export const getAllJobTextAdsByCategory = async (req, res, next) => {
  const { category } = req.params;

  try {
    // Step 1: Validate category
    if (!["Govt", "Private"].includes(category)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "Invalid category. Must be 'Govt' or 'Private'."
          )
        );
    }

    // Step 2: Fetch all JobText ads for the category
    const jobTextAds = withAdMetaList(await JobText.find({ ...activeAdFilter(), category }));

    // Step 3: Check if any ads are found
    if (jobTextAds.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            `No JobText ads found for category: ${category}`
          )
        );
    }

    // Step 4: Return the ads if found
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobTextAds,
          `Fetched all JobText ads for category: ${category}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Update JobText ad by userId and jobTextAdId (from req.body)
export const updateJobTextAdByUserIdAndAdId = async (req, res, next) => {
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
    const existingAd = await JobText.findOne({ userId, _id: adId });
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

    // Step 2: Update the JobText ad using userId and jobTextAdId
    const jobTextAd = await JobText.findOneAndUpdate(
      { userId, _id: adId },
      updateData,
      { new: true, runValidators: true } // Return the updated document and validate the update
    );

    if (!jobTextAd) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `No JobText ad found for userId: ${userId} and adId: ${adId}`
          )
        );
    }

    // Step 3: Optionally update ServiceAds if relevant
    if (updateData.jobAdType || updateData.job_ad_id) {
      await ServiceAds.updateOne(
        { userId, job_ad_id: jobTextAd._id },
        { jobAdType: "JobText", job_ad_id: jobTextAd._id }
      );
    }

    // Step 4: Respond with success
    res
      .status(200)
      .json(new ApiResponse(200, withAdMeta(jobTextAd), "JobText ad updated successfully"));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json(
          new ApiResponse(400, handleValidationError(error), "Validation error")
        );
    }
    next(error);
  }
};

// Delete JobText ad by userId and adId
export const deleteJobTextAdByUserIdAndAdId = async (req, res, next) => {
  const { userId, adId } = req.params;

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Find and delete the JobText ad using userId and adId
    const jobTextAd = await JobText.findOneAndDelete({
      userId,
      _id: adId,
    });

    if (!jobTextAd) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `No JobText ad found for userId: ${userId} and adId: ${adId}`
          )
        );
    }

    // Step 3: Delete the corresponding ServiceAd
    await ServiceAds.deleteOne({ userId, job_ad_id: jobTextAd._id });

    // Step 4: Respond with success
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobTextAd,
          "JobText ad and associated ServiceAd deleted successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};
