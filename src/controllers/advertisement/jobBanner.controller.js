import { JobBanner } from "../../models/advertisement/jobBanner.model.js";
import { ServiceAds } from "../../models/advertisement/service.model.js";
import { User } from "../../models/auth/user.model.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import handleValidationError from "../../utils/validationError.js";

// Create a JobBanner ad and a corresponding ServiceAd
export const createJobBannerAd = async (req, res, next) => {
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
    banner_url,
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

    // Step 4: Create the JobBanner ad
    const jobBannerAd = await JobBanner.create({
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
      banner_url,
      category,
    });

    // Step 5: Automatically create the ServiceAd
    const serviceAd = await ServiceAds.create({
      userId,
      jobAdType: "JobBanner",
      job_ad_id: jobBannerAd._id,
      homeAdType: null,
      home_ads: null,
      generale_ads: null,
    });

    // Step 6: Add the ad ID to the user's adSubscription adsDetails
    user.adSubscription.adsDetails.push({
      adType: "JobBanner",
      adId: jobBannerAd._id,
      details: {
        title,
        company_name,
        work_location,
        website,
        salary,
        city,
        state,
        address,
        pincode,
        banner_url,
        category,
      },
    });

    // Save the updated user
    await user.save();

    // Step 7: Respond with success
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { jobBannerAd, serviceAd },
          "JobBanner and ServiceAd created successfully and added to subscription details"
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

// Get all JobBanner ads
export const getAllJobBannerAds = async (req, res, next) => {
  try {
    const jobBannerAds = await JobBanner.find();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobBannerAds,
          "Fetched all JobBanner ads successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get JobBanner ads by userId
export const getJobBannerAdsByUserId = async (req, res, next) => {
  const { userId } = req.params;

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(userId); // Assuming you have a User model
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Fetch JobBanner ads for the user
    const jobBannerAds = await JobBanner.find({ userId });

    // Step 3: Respond with the JobBanner ads
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobBannerAds,
          `Fetched JobBanner ads for userId: ${userId}`
        )
      );
  } catch (error) {
    next(error); // Pass errors to the error handling middleware
  }
};

// Get JobBanner ads by userId and category
export const getJobBannerAdsByUserIdAndCategory = async (req, res, next) => {
  const { userId, category } = req.params;

  try {
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const jobBannerAds = await JobBanner.find({ userId, category });

    if (jobBannerAds.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            `No JobBanner ads found for userId: ${userId} and category: ${category}`
          )
        );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobBannerAds,
          `Fetched JobBanner ads for userId: ${userId} and category: ${category}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Get all JobBanner ads by category
export const getAllJobBannerAdsByCategory = async (req, res, next) => {
  const { category } = req.params;

  try {
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

    const jobBannerAds = await JobBanner.find({ category });

    if (jobBannerAds.length === 0) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            null,
            `No JobBanner ads found for category: ${category}`
          )
        );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobBannerAds,
          `Fetched all JobBanner ads for category: ${category}`
        )
      );
  } catch (error) {
    next(error);
  }
};

// Update JobBanner ad by userId and jobId (from req.body)
export const updateJobBannerAdByUserIdAndJobId = async (req, res, next) => {
  const { userId } = req.params;
  const { adId, ...updateData } = req.body; // Extract jobId and updateData from req.body

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Update the JobBanner ad using userId and jobId
    const jobBannerAd = await JobBanner.findOneAndUpdate(
      { userId, _id: adId },
      updateData,
      { new: true }
    );

    if (!jobBannerAd) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `No JobBanner ad found for userId: ${userId} and jobId: ${adId}`
          )
        );
    }

    // Step 3: Optionally update ServiceAds if relevant
    if (updateData.jobAdType || updateData.job_ad_id) {
      await ServiceAds.updateOne(
        { userId, job_ad_id: jobBannerAd._id },
        { jobAdType: "JobBanner", job_ad_id: jobBannerAd._id }
      );
    }

    // Step 4: Respond with success
    res
      .status(200)
      .json(
        new ApiResponse(200, jobBannerAd, "JobBanner ad updated successfully")
      );
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

// Delete JobBanner ad by userId and adId
export const deleteJobBannerAdByUserIdAndAdId = async (req, res, next) => {
  const { userId, adId } = req.params;

  try {
    // Step 1: Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Step 2: Find the JobBanner ad using userId and adId
    const jobBannerAd = await JobBanner.findOneAndDelete({
      userId,
      _id: adId,
    });

    if (!jobBannerAd) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            `No JobBanner ad found for userId: ${userId} and adId: ${adId}`
          )
        );
    }

    // Step 3: Delete the corresponding ServiceAd
    await ServiceAds.deleteOne({ userId, job_ad_id: jobBannerAd._id });

    // Step 4: Respond with success
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          jobBannerAd,
          "JobBanner ad and associated ServiceAd deleted successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};
