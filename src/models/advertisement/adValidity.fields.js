import { Schema } from "mongoose";

// Per-ad validity, shared by every pay-per-ad model (Home/Land, Job and
// Local Service ads). Set only by the server from the purchased AdCredit —
// never accepted from client payloads.
export const adValidityFields = {
  tier: {
    type: String,
    enum: ["silver", "gold", "platinum", null],
    default: null,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  isTrusted: {
    type: Boolean,
    default: false,
  },
  creditId: {
    type: Schema.Types.ObjectId,
    ref: "AdCredit",
  },
  // The ad is shown until this moment and auto-deleted after it.
  expiresAt: {
    type: Date,
    index: true,
  },
  // Owner may edit the ad only until this moment (24h after creation).
  editableUntil: {
    type: Date,
  },
};
