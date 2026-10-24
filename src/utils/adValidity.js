import { HomeLandBanner } from "../models/advertisement/homeLandBanner.model.js";
import { HomeLandText } from "../models/advertisement/homeLandText.model.js";
import { JobBanner } from "../models/advertisement/jobBanner.model.js";
import { JobText } from "../models/advertisement/jobText.model.js";
import { ServiceAds } from "../models/advertisement/service.model.js";
import { LocalService } from "../models/local services/localservice.model.js";
import { AdCredit } from "../models/subscription/adCredit.model.js";
import { User } from "../models/auth/user.model.js";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const EDIT_WINDOW_HOURS = 24;
export const RENEW_ALERT_DAYS = 3;
const SWEEP_INTERVAL_MS = HOUR_MS;

// Every pay-per-ad model, keyed by the adType name the app sends.
export const AD_MODELS = {
  HomeLandBanner,
  HomeLandText,
  JobBanner,
  JobText,
  LocalService,
};

// Which credit pool each adType draws from. Local Service credits are scoped
// to the LocalServiceCategory id, so its category comes from the ad itself.
export const AD_CREDIT_SCOPE = {
  HomeLandBanner: { service: "advertisement", category: "HomeLand" },
  HomeLandText: { service: "advertisement", category: "HomeLand" },
  JobBanner: { service: "advertisement", category: "Job" },
  JobText: { service: "advertisement", category: "Job" },
  LocalService: { service: "localService", category: null },
};

export const AD_CATEGORIES = ["HomeLand", "Job"];

export const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Mongo filter for ads that are still within their paid validity.
export const activeAdFilter = () => ({ expiresAt: { $gt: new Date() } });

// Server-owned fields a client must never be able to set through an update.
const PROTECTED_AD_FIELDS = [
  "_id",
  "__v",
  "userId",
  "authId",
  "tier",
  "isPremium",
  "isTrusted",
  "creditId",
  "expiresAt",
  "editableUntil",
  "createdAt",
  "updatedAt",
];

export const stripProtectedAdFields = (body = {}) => {
  const clean = { ...body };
  for (const field of PROTECTED_AD_FIELDS) delete clean[field];
  return clean;
};

export const isEditWindowOpen = (ad) =>
  Boolean(ad?.editableUntil && new Date(ad.editableUntil) > new Date());

// Adds isEditable/daysLeft so the app can hide the edit button and show the
// remaining validity without re-deriving the rules client side.
export const withAdMeta = (ad) => {
  if (!ad) return ad;
  const plain = typeof ad.toObject === "function" ? ad.toObject() : ad;
  const expiresAt = plain.expiresAt ? new Date(plain.expiresAt) : null;

  return {
    ...plain,
    isEditable: isEditWindowOpen(plain),
    daysLeft: expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / DAY_MS))
      : null,
  };
};

export const withAdMetaList = (ads) => ads.map(withAdMeta);

const buildValidityFields = ({ tier, isPremium, isTrusted, creditId, durationInMonths }) => {
  const now = new Date();
  return {
    tier,
    isPremium,
    isTrusted,
    creditId,
    expiresAt: addMonths(now, durationInMonths),
    editableUntil: new Date(now.getTime() + EDIT_WINDOW_HOURS * HOUR_MS),
  };
};

// Consumes one available credit for (service, category), lets createAd build
// the document with the credit's validity, and hands the credit back if the
// ad couldn't be created (e.g. validation error) so the user doesn't lose a
// paid slot. Returns null when the user has no credit for that category.
export const createAdWithCredit = async ({ userId, adType, category, createAd }) => {
  const scope = AD_CREDIT_SCOPE[adType];
  const credit = await AdCredit.findOneAndUpdate(
    {
      userId,
      service: scope.service,
      category: String(scope.category ?? category),
      status: "available",
    },
    { status: "used", usedAt: new Date() },
    { sort: { createdAt: 1 }, new: true }
  );

  if (!credit) return null;

  try {
    const ad = await createAd(
      buildValidityFields({
        tier: credit.tier,
        isPremium: credit.isPremium,
        isTrusted: credit.isTrusted,
        creditId: credit._id,
        durationInMonths: credit.durationInMonths,
      })
    );
    await AdCredit.updateOne(
      { _id: credit._id },
      { usedFor: { adType, adId: ad._id } }
    );
    return ad;
  } catch (error) {
    await AdCredit.updateOne(
      { _id: credit._id },
      { status: "available", $unset: { usedAt: 1, usedFor: 1 } }
    );
    throw error;
  }
};

// Admin-posted ads don't go through payment; they get a fixed validity.
export const buildAdminAdValidityFields = (durationInMonths = 1) =>
  buildValidityFields({
    tier: null,
    isPremium: false,
    isTrusted: false,
    creditId: undefined,
    durationInMonths,
  });

// Deletes every ad whose validity has passed, plus the ServiceAds rows and
// the legacy adsDetails entries that point at them. An ad can only be
// renewed while expiresAt is still in the future, so this can't race a
// renewal.
export const sweepExpiredAds = async () => {
  const now = new Date();

  for (const [adType, Model] of Object.entries(AD_MODELS)) {
    const expired = await Model.find({ expiresAt: { $lte: now } })
      .select("_id")
      .lean();
    if (!expired.length) continue;

    const ids = expired.map((ad) => ad._id);
    await Model.deleteMany({ _id: { $in: ids } });

    if (adType.startsWith("HomeLand")) {
      await ServiceAds.deleteMany({ homeLandAdId: { $in: ids } });
    } else if (adType.startsWith("Job")) {
      await ServiceAds.deleteMany({ job_ad_id: { $in: ids } });
    }

    await User.updateMany(
      { "adSubscription.adsDetails.adId": { $in: ids } },
      { $pull: { "adSubscription.adsDetails": { adId: { $in: ids } } } }
    );

    console.log(`Ad expiry sweep: deleted ${ids.length} expired ${adType} ad(s)`);
  }
};

// Ads created under the old "one subscription, unlimited ads" model have no
// expiresAt. Give each one its owner's old subscription end date, but never
// less than RENEW_ALERT_DAYS from now so the owner still gets the renew alert
// before it is removed. Their 24h edit window is counted from createdAt.
export const backfillLegacyAdValidity = async () => {
  const graceUntil = new Date(Date.now() + RENEW_ALERT_DAYS * DAY_MS);

  for (const [adType, Model] of Object.entries(AD_MODELS)) {
    const legacyAds = await Model.find({ expiresAt: { $exists: false } })
      .select("_id userId createdAt")
      .lean();
    if (!legacyAds.length) continue;

    const subscriptionField =
      adType === "LocalService" ? "localSubscription" : "adSubscription";
    const owners = await User.find({
      _id: { $in: legacyAds.map((ad) => ad.userId) },
    })
      .select(`${subscriptionField}.endDate`)
      .lean();
    const endDateByOwner = new Map(
      owners.map((owner) => [
        String(owner._id),
        owner[subscriptionField]?.endDate,
      ])
    );

    const operations = legacyAds.map((ad) => {
      const endDate = endDateByOwner.get(String(ad.userId));
      const expiresAt =
        endDate && new Date(endDate) > graceUntil ? new Date(endDate) : graceUntil;
      const createdAt = ad.createdAt ? new Date(ad.createdAt) : new Date();

      return {
        updateOne: {
          filter: { _id: ad._id },
          update: {
            $set: {
              expiresAt,
              editableUntil: new Date(
                createdAt.getTime() + EDIT_WINDOW_HOURS * HOUR_MS
              ),
            },
          },
        },
      };
    });

    await Model.bulkWrite(operations);
    console.log(`Ad validity backfill: updated ${operations.length} legacy ${adType} ad(s)`);
  }
};

export const startAdExpiryScheduler = async () => {
  try {
    await backfillLegacyAdValidity();
  } catch (error) {
    console.error("Legacy ad validity backfill failed:", error);
  }

  const run = () =>
    sweepExpiredAds().catch((error) =>
      console.error("Ad expiry sweep failed:", error)
    );

  run();
  setInterval(run, SWEEP_INTERVAL_MS);
};

// Owner's ads that expire within RENEW_ALERT_DAYS — drives the renew alert
// the app shows once each time it is opened.
export const findExpiringAdsForUser = async (userId) => {
  const now = new Date();
  const alertFrom = new Date(now.getTime() + RENEW_ALERT_DAYS * DAY_MS);
  const expiring = [];

  for (const [adType, Model] of Object.entries(AD_MODELS)) {
    let query = Model.find({
      userId,
      expiresAt: { $gt: now, $lte: alertFrom },
    });
    if (adType === "LocalService") query = query.populate("category", "name");

    const ads = await query.lean();
    for (const ad of ads) {
      const scope = AD_CREDIT_SCOPE[adType];
      expiring.push({
        adType,
        adId: ad._id,
        service: scope.service,
        category:
          adType === "LocalService"
            ? String(ad.category?._id ?? ad.category)
            : scope.category,
        title:
          adType === "LocalService"
            ? `${ad.category?.name ?? "Local"} service`
            : ad.title,
        image: ad.banner_url ?? ad.image ?? null,
        expiresAt: ad.expiresAt,
        daysLeft: Math.max(
          0,
          Math.ceil((new Date(ad.expiresAt).getTime() - now.getTime()) / DAY_MS)
        ),
      });
    }
  }

  return expiring.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
};
