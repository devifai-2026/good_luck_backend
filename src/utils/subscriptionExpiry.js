// Gates isPremium/isVerified(trusted) by subscriptionEndDate so an expired
// plan stops showing badges without needing a cron job to sweep the DB.
export const withLiveBadges = (profile) => {
  if (!profile) return profile;

  const plain =
    typeof profile.toObject === "function" ? profile.toObject() : profile;

  const isActive =
    plain.subscriptionEndDate && new Date(plain.subscriptionEndDate) > new Date();

  return {
    ...plain,
    isPremium: Boolean(isActive && plain.isPremium),
    isVerified: Boolean(isActive && plain.isVerified),
  };
};

// Same logic expressed as an aggregation pipeline stage, for list endpoints
// that use $project instead of returning full Mongoose documents.
export const liveBadgeAddFieldsStage = {
  $addFields: {
    isPremium: {
      $and: [
        { $ifNull: ["$isPremium", false] },
        { $gt: ["$subscriptionEndDate", "$$NOW"] },
      ],
    },
    isVerified: {
      $and: [
        { $ifNull: ["$isVerified", false] },
        { $gt: ["$subscriptionEndDate", "$$NOW"] },
      ],
    },
  },
};
