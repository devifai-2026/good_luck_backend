export const TIER_KEYS = ["silver", "gold", "platinum"];

// Applies only price/features from the request body onto a tiered subscription
// document. isPremium/isTrusted are fixed per tier by design and are never
// accepted from the client, even if present in the payload.
export const applyTierUpdates = (subscriptionDoc, body) => {
  let updated = false;

  for (const tierKey of TIER_KEYS) {
    const incoming = body?.[tierKey];
    if (!incoming || typeof incoming !== "object") continue;

    if (incoming.price !== undefined) {
      subscriptionDoc[tierKey].price = incoming.price;
      updated = true;
    }
    if (incoming.features !== undefined) {
      subscriptionDoc[tierKey].features = incoming.features;
      updated = true;
    }
  }

  return updated;
};

// A subscription is only usable while it's flagged subscribed AND not past its
// endDate — nothing flips isSubscribed back to false on expiry.
export const isSubscriptionActive = (subscription) =>
  Boolean(
    subscription?.isSubscribed &&
      subscription?.endDate &&
      new Date(subscription.endDate) > new Date()
  );

// Profile badge fields from the user's tier subscription. Users often buy the
// plan before creating their Matrimony/Dating profile, so the purchase has no
// profile to update yet — new profiles copy the badges from here instead.
export const profileBadgesFromSubscription = (subscription) => {
  if (!isSubscriptionActive(subscription)) return {};
  return {
    isPremium: Boolean(subscription.isPremium),
    isVerified: Boolean(subscription.isTrusted),
    subscriptionTier: subscription.tier ?? null,
    subscriptionEndDate: subscription.endDate,
  };
};

// Badges are earned only through a verified purchase, so profile updates from
// the app must never set them (or the ownership ids).
const PROTECTED_PROFILE_FIELDS = [
  "_id",
  "__v",
  "userId",
  "authId",
  "isPremium",
  "isVerified",
  "subscriptionTier",
  "subscriptionEndDate",
];

export const stripProtectedProfileFields = (body = {}) => {
  const clean = { ...body };
  for (const field of PROTECTED_PROFILE_FIELDS) delete clean[field];
  return clean;
};
