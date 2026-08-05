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
